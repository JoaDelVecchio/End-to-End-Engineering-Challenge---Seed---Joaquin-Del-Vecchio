import type { RequestHandler } from "express";
import type { AppDependencies } from "../appDependencies";
import { createReplySchema } from "../schemas/questionSchemas";
import { reopenQuestion, replyToQuestion, resolveQuestion } from "../../services/questionService";
import { routeParam } from "../validation/routeParams";

export function replyToQuestionController(deps: Required<Pick<AppDependencies, "store" | "now">>): RequestHandler {
  return (request, response, next) => {
    try {
      const payload = createReplySchema.parse(request.body);
      const result = replyToQuestion({
        store: deps.store,
        now: deps.now,
        questionId: routeParam(request.params, "questionId"),
        body: payload.body
      });

      response.json(result);
    } catch (error) {
      next(error);
    }
  };
}

export function resolveQuestionController(deps: Pick<AppDependencies, "store">): RequestHandler {
  return (request, response, next) => {
    try {
      response.json(resolveQuestion({ store: deps.store, questionId: routeParam(request.params, "questionId") }));
    } catch (error) {
      next(error);
    }
  };
}

export function reopenQuestionController(deps: Pick<AppDependencies, "store">): RequestHandler {
  return (request, response, next) => {
    try {
      response.json(reopenQuestion({ store: deps.store, questionId: routeParam(request.params, "questionId") }));
    } catch (error) {
      next(error);
    }
  };
}
