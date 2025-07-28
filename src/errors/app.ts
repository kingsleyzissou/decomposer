import { ContentfulStatusCode } from 'hono/utils/http-status';
import { StatusCodes } from 'http-status-codes';

type AppErrorProps = {
  code?: ContentfulStatusCode;
  message: string;
  details?: unknown;
};

export class AppError extends Error {
  public code: ContentfulStatusCode;
  public details?: unknown;

  constructor({
    message,
    details,
    code = StatusCodes.INTERNAL_SERVER_ERROR,
  }: AppErrorProps) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }

  public response() {
    return {
      body: {
        message: this.message,
        details: this.details,
        code: this.code,
      },
      code: this.code,
    };
  }
}
