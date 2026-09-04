import { asyncHandler } from '../components/asyncHandler.js';
import { SuccessHandler } from '../components/successHandler.js';
import { BadRequest } from '../components/errors.js';
import { askAgent, isAgentConfigured } from '../agent/agentService.js';

// ANSWERS ONE QUESTION, CALLING TOOLS AGAINST LIVE DATA AS NEEDED
export const ask = asyncHandler(async (req, res) => {
  const { question, history = [], user = null } = req.body ?? {};

  if (typeof question !== 'string' || !question.trim()) {
    throw BadRequest(['AGENT_NO_QUESTION', 'A non-empty "question" is required.']);
  }

  const reply = await askAgent({ question: question.trim(), history, user });
  SuccessHandler(reply, res, 200, 'Agent replied');
});

// REPORTS WHETHER AN API KEY IS PRESENT, SO THE UI CAN SHOW LIVE VS OFFLINE
export const status = asyncHandler(async (_req, res) => {
  SuccessHandler(
    { configured: isAgentConfigured(), model: process.env.GEMINI_MODEL || 'gemini-3.6-flash' },
    res,
    200,
    'Agent status',
  );
});
