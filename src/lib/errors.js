export class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }

  static badRequest(message, code = 'BAD_REQUEST') {
    return new AppError(message, 400, code);
  }

  static notFound(message, code = 'NOT_FOUND') {
    return new AppError(message, 404, code);
  }

  static internal(message, code = 'INTERNAL_ERROR') {
    return new AppError(message, 500, code);
  }
}
