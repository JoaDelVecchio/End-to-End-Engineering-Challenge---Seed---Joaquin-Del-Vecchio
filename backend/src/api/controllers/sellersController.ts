import type { RequestHandler } from "express";
import type { AppDependencies } from "../appDependencies";
import { listOrdersQuerySchema } from "../schemas/orderSchemas";
import { listOrdersForSeller } from "../../services/orderService";
import { listUnresolvedQuestionsForSeller } from "../../services/questionService";
import { StoreError } from "../../errors/StoreError";
import { routeParam } from "../validation/routeParams";

export function getSellerController(deps: Pick<AppDependencies, "store">): RequestHandler {
  return (request, response, next) => {
    try {
      const sellerId = routeParam(request.params, "sellerId");
      const seller = deps.store.getSeller(sellerId);

      if (!seller) {
        throw new StoreError(404, "SELLER_NOT_FOUND", `Seller ${sellerId} not found`);
      }

      response.json({ seller });
    } catch (error) {
      next(error);
    }
  };
}

export function listOrdersController(deps: Pick<AppDependencies, "store">): RequestHandler {
  return (request, response, next) => {
    try {
      const query = listOrdersQuerySchema.parse(request.query);
      const orders = listOrdersForSeller({
        store: deps.store,
        sellerId: routeParam(request.params, "sellerId"),
        filters: query
      });

      response.json({ orders });
    } catch (error) {
      next(error);
    }
  };
}

export function listUnresolvedQuestionsController(deps: Required<Pick<AppDependencies, "store" | "now">>): RequestHandler {
  return (request, response, next) => {
    try {
      const questions = listUnresolvedQuestionsForSeller({
        store: deps.store,
        sellerId: routeParam(request.params, "sellerId"),
        now: deps.now
      });

      response.json({ questions });
    } catch (error) {
      next(error);
    }
  };
}
