import cors from "cors";
import express from "express";
import type { AppDependencies } from "./appDependencies";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { ordersRoutes } from "./routes/orders.routes";
import { questionsRoutes } from "./routes/questions.routes";
import { sellersRoutes } from "./routes/sellers.routes";
import { DEFAULT_ALLOWED_ORIGINS } from "../config/env";

export type { AppDependencies } from "./appDependencies";

export function createApp({
  store,
  notifier,
  allowedOrigins = DEFAULT_ALLOWED_ORIGINS,
  now = () => new Date()
}: AppDependencies) {
  const app = express();
  const deps = { store, notifier, now };

  app.use(
    cors({
      origin(origin, callback) {
        callback(null, !origin || allowedOrigins.includes(origin));
      }
    })
  );
  app.use(express.json());

  app.get("/", (_request, response) => {
    response.json({
      name: "Seller Dashboard API",
      frontend: "http://localhost:3000",
      endpoints: {
        health: "/api/health",
        seller: "/api/sellers/seller-1",
        orders: "/api/sellers/seller-1/orders",
        unresolvedQuestions: "/api/sellers/seller-1/questions/unresolved"
      }
    });
  });

  app.get("/api/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.use("/api/sellers", sellersRoutes(deps));
  app.use("/api/orders", ordersRoutes(deps));
  app.use("/api/questions", questionsRoutes(deps));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
