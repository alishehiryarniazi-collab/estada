/**
 * A small typed error we throw anywhere in the app when a request should fail
 * with a specific HTTP status and a user-friendly message.
 *
 * WHY: lets controllers `throw new ApiError(404, 'Listing not found')` and have
 * the global error handler turn it into a clean JSON response automatically —
 * no technical stack traces leak to the user (Section 8 requirement).
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message = 'Invalid request', details?: unknown) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'You must be logged in') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'You are not allowed to do that') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Not found') {
    return new ApiError(404, message);
  }

  static tooMany(message = 'Too many requests, please slow down') {
    return new ApiError(429, message);
  }
}
