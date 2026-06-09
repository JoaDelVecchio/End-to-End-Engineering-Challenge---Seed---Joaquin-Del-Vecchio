import { AppError } from "./AppError";

export class StoreError extends AppError {
  constructor(statusCode: number, code: string, publicMessage: string) {
    super(statusCode, code, publicMessage);
    this.name = "StoreError";
  }
}
