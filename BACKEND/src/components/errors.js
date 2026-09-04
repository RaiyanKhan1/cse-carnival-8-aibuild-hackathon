// Custom error system.
// Each factory accepts either:
//   - a single string code (e.g. BadRequest('INVALID_DAY'))
//   - or a (code, message) tuple, e.g. BadRequest('INVALID_DAY', 'day must be one of Sunday..Thursday')

export class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}

function resolve(codeOrTuple, defaultMessage) {
  if (Array.isArray(codeOrTuple)) {
    const [code, message, details] = codeOrTuple;
    return [code, message ?? defaultMessage, details];
  }
  return [codeOrTuple, defaultMessage, undefined];
}

export const NotFound = (...args) => {
  const [code, message, details] = resolve(args[0], 'Resource not found');
  return new HttpError(404, code, message, details);
};

export const BadRequest = (...args) => {
  const [code, message, details] = resolve(args[0], 'Invalid request');
  return new HttpError(400, code, message, details);
};

export const Unauthorized = (...args) => {
  const [code, message, details] = resolve(args[0], 'Authentication required');
  return new HttpError(401, code, message, details);
};

export const Forbidden = (...args) => {
  const [code, message, details] = resolve(args[0], 'Not allowed');
  return new HttpError(403, code, message, details);
};

export const Conflict = (...args) => {
  const [code, message, details] = resolve(args[0], 'Resource conflict');
  return new HttpError(409, code, message, details);
};

export const Internal = (...args) => {
  const [code, message, details] = resolve(args[0], 'Internal server error');
  return new HttpError(500, code, message, details);
};

// Wrap Prisma errors into clean HttpErrors.
export function fromPrisma(err) {
  if (err?.code === 'P2002') {
    return Conflict('UNIQUE_VIOLATION', `Duplicate value for ${err.meta?.target}`, err.meta);
  }
  if (err?.code === 'P2025') return NotFound('NOT_FOUND', 'Record not found');
  if (err?.code === 'P2003') {
    return BadRequest('FK_VIOLATION', 'Foreign key constraint failed', err.meta);
  }
  return Internal('DATABASE_ERROR', err.message);
}