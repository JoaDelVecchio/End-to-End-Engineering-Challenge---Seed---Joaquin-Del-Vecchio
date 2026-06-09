import { z } from "zod";
import { ORDER_STATUSES } from "../../domain/orderStatus";
import { queryDate } from "../validation/dateQuery";

export const listOrdersQuerySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  buyer: z.string().trim().optional(),
  from: queryDate("from").optional(),
  to: queryDate("to").optional()
});

export const transitionSchema = z.object({
  previousStatus: z.enum(ORDER_STATUSES).optional(),
  status: z.enum(ORDER_STATUSES)
});
