/* ============================================================================
   THE SINGLE SEAM BETWEEN THE UI AND THE AI AGENT.
   ----------------------------------------------------------------------------
   The prompt bar never calls fetch itself — it only calls askCampusAgent().
   To go live, set VITE_AGENT_ENDPOINT in .env and make your backend return
   the AgentReply shape below. No component needs to change.
   ========================================================================== */

// Point this at your agent route, e.g. VITE_AGENT_ENDPOINT=http://localhost:3000/api/agent
const ENDPOINT = import.meta.env.VITE_AGENT_ENDPOINT ?? ''

// The UI uses this to show a "Demo" vs "Live" badge and an honest empty state.
export const isAgentConfigured = Boolean(ENDPOINT)

/**
 * What every reply looks like once it reaches the UI.
 *
 * @typedef {Object} AgentReply
 * @property {string}   text     The answer to render.
 * @property {'answer'|'clarify'|'refused'} status
 *           'clarify' when the agent needs more info before acting,
 *           'refused' when it declined — both get their own styling.
 * @property {string[]} sources  Which systems were read, e.g. ['rooms', 'schedule'].
 *                               Rendered as chips under the answer.
 * @property {?{label: string, detail?: string}} action
 *           Set when the agent actually changed something (booked a room,
 *           registered for an event) so the UI can confirm it visibly.
 */

/**
 * Ask the campus agent a question.
 *
 * @param {Object}   opts
 * @param {string}   opts.question  The user's message.
 * @param {Array}    opts.history   Prior turns, oldest first (see toHistory).
 * @param {AbortSignal} [opts.signal]  Wired to the Stop button.
 * @returns {Promise<AgentReply>}
 */
export async function askCampusAgent({ question, history = [], signal }) {
  // TODO: delete this branch once VITE_AGENT_ENDPOINT is set.
  if (!isAgentConfigured) return mockReply({ question, signal })

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, history }),
    signal,
  })

  if (!res.ok) {
    throw new Error(`Agent request failed (${res.status} ${res.statusText})`)
  }

  return normalizeReply(await res.json())
}

/**
 * Accepts whatever shape the backend settles on and always hands the UI a
 * complete AgentReply, so a missing field can never crash a render.
 */
function normalizeReply(raw) {
  const text =
    typeof raw === 'string' ? raw : (raw?.text ?? raw?.answer ?? raw?.message ?? '')

  return {
    text: String(text).trim() || 'The agent returned an empty response.',
    status: raw?.status === 'clarify' || raw?.status === 'refused' ? raw.status : 'answer',
    sources: Array.isArray(raw?.sources) ? raw.sources : [],
    action: raw?.action?.label ? raw.action : null,
  }
}

/**
 * Converts the UI's message list into the plain turns the API expects,
 * so the components never have to know the wire format.
 */
export function toHistory(messages) {
  return messages
    .filter((m) => !m.pending && !m.error && m.text)
    .map((m) => ({ role: m.role === 'agent' ? 'assistant' : 'user', content: m.text }))
}

/* -------------------------------------------------------------------------
   MOCK — stands in until the endpoint exists. Deliberately does NOT invent
   campus answers; it echoes the question so nobody mistakes it for real data.
   ------------------------------------------------------------------------- */
function mockReply({ question, signal }) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve({
        text:
          `The agent isn't connected yet, so I can't answer "${question}" from live campus data.\n\n` +
          `Set VITE_AGENT_ENDPOINT in .env and this same prompt bar will start ` +
          `returning real answers — no UI changes needed.`,
        status: 'answer',
        sources: [],
        action: null,
      })
    }, 700)

    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}
