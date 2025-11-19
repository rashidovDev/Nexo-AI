export default class BaseError extends Error {
  status: number;
  errors: unknown[];

  constructor(status: number, message: string, errors: unknown[] = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static BadRequest(message: string, errors: unknown[] = []) {
    return new BaseError(400, message, errors);
  }

  static Unauthorized() {
    return new BaseError(401, 'Unauthorized');
  }
}
