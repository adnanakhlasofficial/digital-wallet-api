export default class AppError extends Error {
  constructor(public status: number, message: string, stack: string = "") {
    super(message);
    this.status = status;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
