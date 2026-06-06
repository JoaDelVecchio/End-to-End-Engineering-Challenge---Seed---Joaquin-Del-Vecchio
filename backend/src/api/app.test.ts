import request from "supertest";
import { createApp } from "./app";
import { InMemoryStore } from "../data/store";
import { createSeedData } from "../data/seedData";
import { NotificationEvent, Notifier } from "../services/notifications";

class RecordingNotifier implements Notifier {
  readonly events: NotificationEvent[] = [];

  async notify(event: NotificationEvent): Promise<void> {
    this.events.push(event);
  }
}

class FailingNotifier implements Notifier {
  async notify(_event: NotificationEvent): Promise<void> {
    throw new Error("Notification channel unavailable");
  }
}

function setup() {
  const store = new InMemoryStore(createSeedData());
  const notifier = new RecordingNotifier();
  const app = createApp({ store, notifier, now: () => new Date("2026-06-06T15:00:00.000Z") });

  return { app, store, notifier };
}

describe("seller dashboard API", () => {
  it("returns seller identity for the dashboard header", async () => {
    const { app } = setup();

    const response = await request(app)
      .get("/api/sellers/seller-1")
      .expect(200);

    expect(response.body.seller).toMatchObject({
      id: "seller-1",
      name: "Tecno Sur",
      reputation: "MercadoLíder"
    });
  });

  it("filters seller orders by status and buyer search", async () => {
    const { app } = setup();

    const response = await request(app)
      .get("/api/sellers/seller-1/orders")
      .query({ status: "shipped", buyer: "ana" })
      .expect(200);

    expect(response.body.orders).toHaveLength(1);
    expect(response.body.orders[0]).toMatchObject({
      id: "ord-1002",
      status: "shipped",
      buyer: { name: "Ana Perez" }
    });
    expect(response.body.orders[0].items).toHaveLength(2);
  });

  it("accepts date-only order filters from browser date inputs", async () => {
    const { app } = setup();

    const response = await request(app)
      .get("/api/sellers/seller-1/orders")
      .query({ from: "2026-06-05", to: "2026-06-06" })
      .expect(200);

    expect(response.body.orders.map((order: { id: string }) => order.id)).toEqual(["ord-1001", "ord-1004"]);
  });

  it("returns unresolved questions sorted by calculated importance", async () => {
    const { app } = setup();

    const response = await request(app)
      .get("/api/sellers/seller-1/questions/unresolved")
      .expect(200);

    expect(response.body.questions[0]).toMatchObject({
      id: "q-9002",
      priority: { level: "critical" }
    });
    expect(response.body.questions.every((question: { status: string }) => question.status !== "resolved")).toBe(true);
  });

  it("keeps answered questions in the priority queue until they are resolved", async () => {
    const { app } = setup();

    await request(app)
      .post("/api/questions/q-9001/replies")
      .send({ body: "I will dispatch it today." })
      .expect(200);

    const answeredResponse = await request(app)
      .get("/api/sellers/seller-1/questions/unresolved")
      .expect(200);

    expect(answeredResponse.body.questions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "q-9001",
          status: "answered"
        })
      ])
    );

    await request(app)
      .patch("/api/questions/q-9001/resolve")
      .expect(200);

    const resolvedResponse = await request(app)
      .get("/api/sellers/seller-1/questions/unresolved")
      .expect(200);

    expect(
      resolvedResponse.body.questions.some((question: { id: string }) => question.id === "q-9001")
    ).toBe(false);
  });

  it("keeps delivered-order questions in priority until the conversation is resolved", async () => {
    const { app } = setup();

    await request(app)
      .patch("/api/orders/ord-1002/status")
      .send({ status: "delivered" })
      .expect(200);

    const unresolvedResponse = await request(app)
      .get("/api/sellers/seller-1/questions/unresolved")
      .expect(200);

    expect(unresolvedResponse.body.questions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "q-9002",
          status: "open",
          order: expect.objectContaining({
            id: "ord-1002",
            status: "delivered"
          })
        })
      ])
    );

    await request(app)
      .patch("/api/questions/q-9002/resolve")
      .expect(200);

    const resolvedResponse = await request(app)
      .get("/api/sellers/seller-1/questions/unresolved")
      .expect(200);

    expect(
      resolvedResponse.body.questions.some((question: { id: string }) => question.id === "q-9002")
    ).toBe(false);
  });

  it("adds a seller reply and marks the question answered", async () => {
    const { app } = setup();

    const response = await request(app)
      .post("/api/questions/q-9001/replies")
      .send({ body: "I will dispatch it today." })
      .expect(200);

    expect(response.body.question.status).toBe("answered");
    expect(response.body.question.replies[0]).toMatchObject({
      author: "seller",
      body: "I will dispatch it today."
    });
  });

  it("resolves a question", async () => {
    const { app } = setup();

    const response = await request(app)
      .patch("/api/questions/q-9001/resolve")
      .expect(200);

    expect(response.body.question.status).toBe("resolved");
  });

  it("reopens a resolved question so it returns to the priority queue", async () => {
    const { app } = setup();

    await request(app)
      .patch("/api/questions/q-9001/resolve")
      .expect(200);

    const reopenResponse = await request(app)
      .patch("/api/questions/q-9001/reopen")
      .expect(200);

    expect(reopenResponse.body.question.status).toBe("open");

    const priorityResponse = await request(app)
      .get("/api/sellers/seller-1/questions/unresolved")
      .expect(200);

    expect(priorityResponse.body.questions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "q-9001",
          status: "open"
        })
      ])
    );
  });

  it("rejects reopening questions that are already unresolved", async () => {
    const { app } = setup();

    const response = await request(app)
      .patch("/api/questions/q-9001/reopen")
      .expect(409);

    expect(response.body).toEqual({
      error: "Only resolved questions can be reopened"
    });
  });

  it("rejects invalid order lifecycle transitions as a conflict", async () => {
    const { app } = setup();

    const response = await request(app)
      .patch("/api/orders/ord-1003/status")
      .send({ status: "paid" })
      .expect(409);

    expect(response.body).toEqual({
      error: "Invalid order status transition from delivered to paid"
    });
  });

  it("returns a JSON 404 for unknown routes", async () => {
    const { app } = setup();

    const response = await request(app)
      .get("/api/does-not-exist")
      .expect(404);

    expect(response.body).toEqual({ error: "Route not found" });
  });

  it("allows configured frontend origins through CORS", async () => {
    const { app } = setup();

    const response = await request(app)
      .get("/api/health")
      .set("Origin", "http://127.0.0.1:3000")
      .expect(200);

    expect(response.headers["access-control-allow-origin"]).toBe("http://127.0.0.1:3000");
  });

  it("does not expose CORS access to unknown browser origins", async () => {
    const { app } = setup();

    const response = await request(app)
      .get("/api/health")
      .set("Origin", "https://example.invalid")
      .expect(200);

    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("notifies when a created question is high priority or critical", async () => {
    const { app, notifier } = setup();

    await request(app)
      .post("/api/orders/ord-1002/questions")
      .send({
        body: "The laptop is broken, this is urgent and I want a refund",
        productId: "prod-1"
      })
      .expect(201);

    expect(notifier.events).toHaveLength(1);
    expect(notifier.events[0]).toMatchObject({
      sellerId: "seller-1",
      channel: "email",
      priority: "critical"
    });
  });

  it("keeps high priority question creation successful when notification delivery fails", async () => {
    const store = new InMemoryStore(createSeedData());
    const app = createApp({
      store,
      notifier: new FailingNotifier(),
      now: () => new Date("2026-06-06T15:00:00.000Z")
    });
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);

    try {
      const response = await request(app)
        .post("/api/orders/ord-1002/questions")
        .send({
          body: "La laptop llegó rota, necesito devolución urgente",
          productId: "prod-1"
        })
        .expect(201);

      expect(response.body.question).toMatchObject({
        status: "open",
        priority: { level: "critical" }
      });
      expect(store.getOrder("ord-1002")?.questions).toHaveLength(2);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[notification] failed"),
        expect.any(Error)
      );
    } finally {
      warnSpy.mockRestore();
    }
  });
});
