import { Router } from "express";
import type { AppDependencies } from "../appDependencies";
import {
  reopenQuestionController,
  replyToQuestionController,
  resolveQuestionController
} from "../controllers/questionsController";

export function questionsRoutes(deps: Required<Pick<AppDependencies, "store" | "now">>) {
  const router = Router();

  router.post("/:questionId/replies", replyToQuestionController(deps));
  router.patch("/:questionId/resolve", resolveQuestionController(deps));
  router.patch("/:questionId/reopen", reopenQuestionController(deps));

  return router;
}
