import colors from 'colors';

// BASE ERROR CLASS WITH HTTP STATUS AND STRUCTURED CODE
export class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}

// NORMALISES FACTORY ARGUMENTS INTO A [CODE, MESSAGE, DETAILS] TRIPLE
function resolve(codeOrTuple, defaultMessage) {
  if (Array.isArray(codeOrTuple)) {
    const [code, message, details] = codeOrTuple;
    return [code, message ?? defaultMessage, details];
  }
  return [codeOrTuple, defaultMessage, undefined];
}

// BUILDS A 404 HTTPERROR
export const NotFound = (...args) => {
  const [code, message, details] = resolve(args[0], 'Resource not found');
  return new HttpError(404, code, message, details);
};

// BUILDS A 400 HTTPERROR
export const BadRequest = (...args) => {
  const [code, message, details] = resolve(args[0], 'Invalid request');
  return new HttpError(400, code, message, details);
};

// BUILDS A 401 HTTPERROR
export const Unauthorized = (...args) => {
  const [code, message, details] = resolve(args[0], 'Authentication required');
  return new HttpError(401, code, message, details);
};

// BUILDS A 403 HTTPERROR
export const Forbidden = (...args) => {
  const [code, message, details] = resolve(args[0], 'Not allowed');
  return new HttpError(403, code, message, details);
};

// BUILDS A 409 HTTPERROR
export const Conflict = (...args) => {
  const [code, message, details] = resolve(args[0], 'Resource conflict');
  return new HttpError(409, code, message, details);
};

// BUILDS A 500 HTTPERROR
export const Internal = (...args) => {
  const [code, message, details] = resolve(args[0], 'Internal server error');
  return new HttpError(500, code, message, details);
};

// MAPS KNOWN PRISMA ERROR CODES INTO STRUCTURED HTTPERRORS
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