import { Router } from "express";
import type { AppDependencies } from "../appDependencies";
import {
  getSellerController,
  listOrdersController,
  listUnresolvedQuestionsController
} from "../controllers/sellersController";

export function sellersRoutes(deps: Required<Pick<AppDependencies, "store" | "now">>) {
  const router = Router();

  router.get("/:sellerId", getSellerController(deps));
  router.get("/:sellerId/orders", listOrdersController(deps));
  router.get("/:sellerId/questions/unresolved", listUnresolvedQuestionsController(deps));

  return router;
}
