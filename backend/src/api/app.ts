import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { OrderStatus } from "../domain/types";
import { ORDER_STATUSES } from "../domain/orderStatus";
import { classifyQuestion, getOrderTotal } from "../domain/questionPriority";
import { InMemoryStore, StoreError } from "../data/store";
import { Notifier, shouldNotifyPriority } from "../services/notifications";
import { DEFAULT_ALLOWED_ORIGINS } from "../config/env";

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

function queryDate(boundary: "from" | "to") {
  return z.string().trim().transform((value, context) => {
    if (dateOnlyPattern.test(value)) {
      return boundary === "from" ? `${value}T00:00:00.000Z` : `${value}T23:59:59.999Z`;
    }

    if (!z.string().datetime().safeParse(value).success) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid date or datetime"
      });
      return z.NEVER;
    }

    return value;
  });
}

const listOrdersQuerySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  buyer: z.string().trim().optional(),
  from: queryDate("from").optional(),
  to: queryDate("to").optional()
});

const createQuestionSchema = z.object({
  body: z.string().trim().min(3),
  productId: z.string().trim().min(1).optional()
});

const createReplySchema = z.object({
  body: z.string().trim().min(2)
});

const transitionSchema = z.object({
  status: z.enum(ORDER_STATUSES)
});

export interface AppDependencies {
  store: InMemoryStore;
  notifier: Notifier;
  allowedOrigins?: string[];
  now?: () => Date;
}

export function createApp({
  store,
  notifier,
  allowedOrigins = DEFAULT_ALLOWED_ORIGINS,
  now = () => new Date()
}: AppDependencies) {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        callback(null, !origin || allowedOrigins.includes(origin));
      }
    })
  );
  app.use(express.json());

  app.get("/api/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.get("/api/sellers/:sellerId", (request, response, next) => {
    try {
      const seller = store.getSeller(request.params.sellerId);

      if (!seller) {
        response.status(404).json({ error: `Seller ${request.params.sellerId} not found` });
        return;
      }

      response.json({ seller });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/sellers/:sellerId/orders", (request, response, next) => {
    try {
      const query = listOrdersQuerySchema.parse(request.query);
      const orders = store
        .listOrders(request.params.sellerId, query)
        .map((order) => enrichOrder(order));

      response.json({ orders });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/sellers/:sellerId/questions/unresolved", (request, response, next) => {
    try {
      const questions = store
        .listUnresolvedQuestions(request.params.sellerId, now())
        .map(({ question, order, priority }) => ({
          ...question,
          priority,
          order: {
            id: order.id,
            status: order.status,
            date: order.date,
            buyer: order.buyer,
            total: getOrderTotal(order)
          },
          product: question.productId
            ? order.items.find((item) => item.productId === question.productId)
            : undefined
        }));

      response.json({ questions });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/orders/:orderId/questions", async (request, response, next) => {
    try {
      const payload = createQuestionSchema.parse(request.body);
      const { order, question } = store.addQuestion({
        orderId: request.params.orderId,
        body: payload.body,
        productId: payload.productId,
        createdAt: now()
      });
      const priority = classifyQuestion(question, order, now());

      if (shouldNotifyPriority(priority.level)) {
        try {
          await notifier.notify({
            channel: "email",
            sellerId: order.sellerId,
            orderId: order.id,
            questionId: question.id,
            priority: priority.level,
            subject: `${priority.level.toUpperCase()} buyer question`,
            body: question.body
          });
        } catch (notificationError) {
          console.warn(
            `[notification] failed seller=${order.sellerId} order=${order.id} question=${question.id}`,
            notificationError
          );
        }
      }

      response.status(201).json({ question: { ...question, priority } });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/questions/:questionId/replies", (request, response, next) => {
    try {
      const payload = createReplySchema.parse(request.body);
      const { question } = store.addReply({
        questionId: request.params.questionId,
        body: payload.body,
        createdAt: now()
      });

      response.json({ question });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/questions/:questionId/resolve", (request, response, next) => {
    try {
      const { question } = store.resolveQuestion(request.params.questionId);
      response.json({ question });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/questions/:questionId/reopen", (request, response, next) => {
    try {
      const { question } = store.reopenQuestion(request.params.questionId);
      response.json({ question });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/orders/:orderId/status", (request, response, next) => {
    try {
      const payload = transitionSchema.parse(request.body);
      const order = store.transitionOrder(request.params.orderId, payload.status as OrderStatus);
      response.json({ order: enrichOrder(order) });
    } catch (error) {
      next(error);
    }
  });

  app.use((_request, response) => {
    response.status(404).json({ error: "Route not found" });
  });

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    if (error instanceof z.ZodError) {
      response.status(400).json({ error: "Validation error", details: error.flatten() });
      return;
    }

    if (error instanceof StoreError) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }

    response.status(500).json({ error: "Internal server error" });
  });

  return app;
}

function enrichOrder<T extends { items: Array<{ quantity: number; unitPrice: number }> }>(order: T): T & { total: number } {
  return {
    ...order,
    total: order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  };
}
