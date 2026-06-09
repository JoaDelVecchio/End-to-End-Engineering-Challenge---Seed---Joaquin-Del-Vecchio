import { Router } from "express";
import type { AppDependencies } from "../appDependencies";
import { createQuestionController, transitionOrderController } from "../controllers/ordersController";

export function ordersRoutes(deps: Required<Pick<AppDependencies, "store" | "notifier" | "now">>) {
  const router = Router();

  router.post("/:orderId/questions", createQuestionController(deps));
  router.patch("/:orderId/status", transitionOrderController(deps));

  return router;
}
