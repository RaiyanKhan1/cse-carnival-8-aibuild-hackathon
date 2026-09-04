import { HttpError } from './errors.js';

export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: err.message || 'INTERNAL_ERROR' });
}