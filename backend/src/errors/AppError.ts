export class AppError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    readonly publicMessage: string
  ) {
    super(publicMessage);
    this.name = "AppError";
  }
}
