export interface AppErrorOptions {
  statusCode: number;
  message: string;
  isOperational?: boolean;
  details?: unknown;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor({
    statusCode,
    message,
    isOperational = true,
    details,
  }: AppErrorOptions) {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace (V8 engines like Node.js)
    Error.captureStackTrace?.(this, this.constructor);
  }
}