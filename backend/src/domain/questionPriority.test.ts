import { classifyQuestion, sortQuestionsByImportance } from "./questionPriority";
import { Order, Question } from "./types";

const now = new Date("2026-06-06T15:00:00.000Z");

function order(overrides: Partial<Order> = {}): Order {
  return {
    id: "ord-1",
    sellerId: "seller-1",
    buyer: {
      id: "buyer-1",
      name: "Ana Perez",
      email: "ana@example.com"
    },
    status: "shipped",
    date: "2026-06-04T10:00:00.000Z",
    items: [
      {
        productId: "prod-phone",
        title: "Smartphone Pro",
        category: "electronics",
        quantity: 2,
        unitPrice: 420
      }
    ],
    questions: [],
    ...overrides
  };
}

function question(overrides: Partial<Question> = {}): Question {
  return {
    id: "q-1",
    orderId: "ord-1",
    productId: "prod-phone",
    buyerId: "buyer-1",
    body: "The phone arrived broken and I need a refund urgently",
    status: "open",
    createdAt: "2026-06-04T12:00:00.000Z",
    replies: [],
    ...overrides
  };
}

describe("question priority", () => {
  it("classifies expensive, overdue, refund-related questions as critical", () => {
    const result = classifyQuestion(question(), order(), now);

    expect(result.level).toBe("critical");
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.reasons).toEqual(
      expect.arrayContaining([
        "valor alto de la orden",
        "esperando más de 24 horas",
        "palabra clave crítica",
        "categoría de riesgo"
      ])
    );
  });

  it("prioritizes Spanish LATAM questions with accents and localized reasons", () => {
    const result = classifyQuestion(
      question({
        body: "La laptop llegó rota, es urgente y necesito una devolución.",
        createdAt: "2026-06-06T10:00:00.000Z"
      }),
      order(),
      now
    );

    expect(result.level).toBe("critical");
    expect(result.reasons).toEqual(
      expect.arrayContaining([
        "valor alto de la orden",
        "palabra clave crítica",
        "categoría de riesgo"
      ])
    );
  });

  it("detects Spanish shipping and address issues without relying on English keywords", () => {
    const result = classifyQuestion(
      question({
        body: "No llegó el paquete y necesito corregir la dirección de entrega.",
        createdAt: "2026-06-06T05:00:00.000Z",
        productId: undefined
      }),
      order({
        status: "paid",
        items: [{ productId: "prod-1", title: "Set de embalaje", category: "supplies", quantity: 1, unitPrice: 20 }]
      }),
      now
    );

    expect(result.level).toBe("medium");
    expect(result.reasons).toContain("palabra clave de envío");
  });

  it("sorts unresolved questions by priority, score, and age", () => {
    const low = question({
      id: "q-low",
      body: "Can you send me the invoice?",
      createdAt: "2026-06-06T13:30:00.000Z",
      productId: undefined
    });
    const critical = question({ id: "q-critical" });
    const resolved = question({ id: "q-resolved", status: "resolved" });

    const result = sortQuestionsByImportance(
      [
        { question: low, order: order({ id: "ord-low", status: "paid", items: [] }) },
        { question: resolved, order: order({ id: "ord-resolved" }) },
        { question: critical, order: order({ id: "ord-critical" }) }
      ],
      now
    );

    expect(result.map((item) => item.question.id)).toEqual(["q-critical", "q-low"]);
    expect(result[0].priority.level).toBe("critical");
  });
});
