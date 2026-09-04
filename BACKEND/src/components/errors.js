export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const NotFound = (msg = 'NOT_FOUND') => new HttpError(404, msg);
export const BadRequest = (msg = 'BAD_REQUEST') => new HttpError(400, msg);
export const Conflict = (msg = 'CONFLICT') => new HttpError(409, msg);