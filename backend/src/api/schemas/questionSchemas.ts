import { z } from "zod";

export const createQuestionSchema = z.object({
  body: z.string().trim().min(3),
  productId: z.string().trim().min(1).optional()
});

export const createReplySchema = z.object({
  body: z.string().trim().min(2)
});
