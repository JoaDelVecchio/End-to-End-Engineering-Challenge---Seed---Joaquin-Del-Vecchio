import type { RequestHandler } from "express";
import type { AppDependencies } from "../appDependencies";
import { transitionSchema } from "../schemas/orderSchemas";
import { createQuestionSchema } from "../schemas/questionSchemas";
import { transitionOrder } from "../../services/orderService";
import { createQuestionForOrder } from "../../services/questionService";
import { routeParam } from "../validation/routeParams";

export function createQuestionController(deps: Required<Pick<AppDependencies, "store" | "notifier" | "now">>): RequestHandler {
  return async (request, response, next) => {
    try {
      const payload = createQuestionSchema.parse(request.body);
      const result = await createQuestionForOrder({
        store: deps.store,
        notifier: deps.notifier,
        now: deps.now,
        orderId: routeParam(request.params, "orderId"),
        body: payload.body,
        productId: payload.productId
      });

      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export function transitionOrderController(deps: Pick<AppDependencies, "store">): RequestHandler {
  return (request, response, next) => {
    try {
      const payload = transitionSchema.parse(request.body);
      const order = transitionOrder({
        store: deps.store,
        orderId: routeParam(request.params, "orderId"),
        previousStatus: payload.previousStatus,
        status: payload.status
      });

      response.json({ order });
    } catch (error) {
      next(error);
    }
  };
}
