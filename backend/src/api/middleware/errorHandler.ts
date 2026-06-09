import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../../errors/AppError";

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof z.ZodError) {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation error",
        details: error.flatten()
      }
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.publicMessage
      }
    });
    return;
  }

  console.error(error);

  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error"
    }
  });
}
