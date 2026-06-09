import { InMemoryStore } from "../data/store";
import { createSeedData } from "../data/seedData";
import type { NotificationEvent, Notifier } from "./notifications";
import {
  createQuestionForOrder,
  listUnresolvedQuestionsForSeller,
  replyToQuestion,
  resolveQuestion
} from "./questionService";

class RecordingNotifier implements Notifier {
  readonly events: NotificationEvent[] = [];

  async notify(event: NotificationEvent): Promise<void> {
    this.events.push(event);
  }
}

const now = () => new Date("2026-06-06T15:00:00.000Z");

describe("question service", () => {
  it("creates prioritized questions and notifies high-risk cases", async () => {
    const store = new InMemoryStore(createSeedData());
    const notifier = new RecordingNotifier();

    const result = await createQuestionForOrder({
      store,
      notifier,
      now,
      orderId: "ord-1002",
      productId: "prod-1",
      body: "La laptop llegó rota, necesito devolución urgente"
    });

    expect(result.question.priority.level).toBe("critical");
    expect(notifier.events).toHaveLength(1);
  });

  it("keeps answered questions unresolved until explicit resolution", () => {
    const store = new InMemoryStore(createSeedData());

    replyToQuestion({ store, now, questionId: "q-9001", body: "Sale hoy." });

    expect(
      listUnresolvedQuestionsForSeller({ store, sellerId: "seller-1", now }).some(
        (question) => question.id === "q-9001" && question.status === "answered"
      )
    ).toBe(true);

    resolveQuestion({ store, questionId: "q-9001" });

    expect(
      listUnresolvedQuestionsForSeller({ store, sellerId: "seller-1", now }).some(
        (question) => question.id === "q-9001"
      )
    ).toBe(false);
  });

  it("rejects listing unresolved questions for an unknown seller", () => {
    const store = new InMemoryStore(createSeedData());

    expect(() => listUnresolvedQuestionsForSeller({ store, sellerId: "missing-seller", now })).toThrow(
      "Seller missing-seller not found"
    );
  });
});
