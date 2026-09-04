import { GoogleGenAI } from '@google/genai';
import { buildSystemInstruction } from './systemPrompt.js';
import { TOOL_SOURCES, WRITE_TOOLS, executeTool, toolDeclarations } from './tools.js';

/* ============================================================================
   THE AGENT LOOP
   ----------------------------------------------------------------------------
   Gemini decides which tools to call; we run them against PostgreSQL and hand
   the results back, repeating until it produces a final answer. This is real
   function calling — the model is never shown a pre-baked dump of campus data.
   ========================================================================== */

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

// A runaway model shouldn't loop forever against the database.
const MAX_TURNS = 6;

let client = null;

// LAZY SO THE SERVER STILL BOOTS (AND OTHER ROUTES WORK) WITHOUT A KEY SET
function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error(
      'GEMINI_API_KEY is not set. Add it to BACKEND/.env to enable the agent.',
    );
    err.status = 503;
    throw err;
  }
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}

export const isAgentConfigured = () => Boolean(process.env.GEMINI_API_KEY);

// LOCAL CALENDAR DATE, NOT UTC
function todayParts() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return {
    today: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    weekday: now.toLocaleDateString('en-US', { weekday: 'long' }),
  };
}

// MAPS PRIOR UI TURNS INTO GEMINI CONTENTS
function toContents(history = [], question) {
  const contents = history
    .filter((m) => typeof m?.content === 'string' && m.content.trim())
    .slice(-10) // keep the prompt small; the tools carry the real state
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  contents.push({ role: 'user', parts: [{ text: question }] });
  return contents;
}

/**
 * Answers one question.
 *
 * @returns {Promise<{text: string, status: 'answer'|'clarify'|'refused',
 *                    sources: string[], action: ?object, toolCalls: object[]}>}
 */
export async function askAgent({ question, history = [], user = null }) {
  const ai = getClient();
  const { today, weekday } = todayParts();

  const contents = toContents(history, question);
  const config = {
    systemInstruction: buildSystemInstruction({ user, today, weekday }),
    tools: [{ functionDeclarations: toolDeclarations }],
    temperature: 0.2, // scheduling answers should be repeatable, not creative
  };

  const sources = new Set();
  const toolCalls = [];
  let status = 'answer';
  let action = null;

  for (let turn = 0; turn < MAX_TURNS; turn += 1) {
    const response = await generateWithRetry(ai, { model: MODEL, contents, config });

    const calls = response.functionCalls ?? [];
    if (calls.length === 0) {
      const text = stripMarkdown(response.text ?? '');
      return {
        text: text || 'I could not put together an answer for that.',
        status,
        sources: [...sources],
        action,
        toolCalls,
      };
    }

    // Push the model's turn back EXACTLY as it came. Gemini 3.x attaches a
    // thoughtSignature to functionCall parts and rejects the next request if
    // it is missing, so this must not be rebuilt by hand from functionCalls.
    const modelTurn = response.candidates?.[0]?.content;
    contents.push(
      modelTurn ?? {
        role: 'model',
        parts: calls.map((c) => ({ functionCall: { name: c.name, args: c.args ?? {} } })),
      },
    );

    const responseParts = [];

    for (const call of calls) {
      const result = await executeTool(call.name, call.args ?? {}, { user });
      toolCalls.push({ name: call.name, args: call.args ?? {}, ok: !result?.error });

      if (TOOL_SOURCES[call.name]) sources.add(TOOL_SOURCES[call.name]);

      // The two control tools set how the UI presents the reply.
      if (call.name === 'ask_clarifying_question') status = 'clarify';
      if (call.name === 'decline_request') status = 'refused';

      // Only a write that actually succeeded counts as a confirmed action.
      if (WRITE_TOOLS.has(call.name) && !result?.error) {
        action = { label: actionLabel(call.name), detail: result.summary ?? null };
      }

      responseParts.push({
        functionResponse: { name: call.name, response: { result } },
      });
    }

    contents.push({ role: 'user', parts: responseParts });
  }

  return {
    text: 'That turned into too many steps for me to finish safely. Could you narrow the question down?',
    status: 'clarify',
    sources: [...sources],
    action,
    toolCalls,
  };
}

// Gemini returns 503 when a model is briefly over capacity and 429 when rate
// limited. Both are transient, so a student's question should not fail on the
// first one — retry a couple of times with backoff before giving up.
const TRANSIENT = new Set([429, 503]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generateWithRetry(ai, request, attempts = 4) {
  let lastError;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await ai.models.generateContent(request);
    } catch (err) {
      const message = err?.message ?? '';
      const code = err?.status ?? Number(/"code":\s*(\d+)/.exec(message)?.[1]);
      if (!TRANSIENT.has(code) || attempt === attempts - 1) throw err;

      // A per-day quota will not free up by waiting — fail fast and say so
      // rather than stalling the user for 30 seconds to no purpose.
      if (/PerDay/i.test(message)) {
        err.message =
          'The Gemini free-tier daily quota for this model is used up. ' +
          'Set GEMINI_MODEL to another model in BACKEND/.env, or enable billing.';
        throw err;
      }

      // Free-tier 429s come with the server's own retryDelay, e.g. "27s".
      const advised = /"retryDelay":\s*"(\d+)s"/.exec(message)?.[1];
      const wait = advised ? Number(advised) * 1000 : 1000 * 2 ** attempt;

      lastError = err;
      await sleep(Math.min(wait, 30000));
    }
  }

  throw lastError;
}

/**
 * The model still reaches for markdown despite being told not to, and the
 * prompt bar renders plain text — so "**Room 7A04**" would show its asterisks.
 * Strip emphasis markers while leaving the wording untouched.
 */
function stripMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/gs, '$1')
    .replace(/(^|[\s(])\*(\S(?:.*?\S)?)\*(?=[\s.,;:!?)]|$)/gs, '$1$2')
    .replace(/^#{1,6}\s+/gm, '')
    .trim();
}

// HUMAN LABEL FOR THE "DONE" CHIP IN THE UI
function actionLabel(toolName) {
  return {
    book_room: 'Room booked',
    register_for_event: 'Registered for event',
    cancel_booking: 'Booking cancelled',
  }[toolName] ?? 'Action completed';
}
