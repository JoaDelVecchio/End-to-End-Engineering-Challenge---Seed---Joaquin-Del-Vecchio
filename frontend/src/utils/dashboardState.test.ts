import type { Order, PriorityQuestion } from "../domain/types";
import { mergeUpdatedOrder, mergeUpdatedOrderIntoPriorityQuestions } from "./dashboardState";

const updatedOrder: Order = {
  id: "ord-1",
  sellerId: "seller-1",
  buyer: { id: "buyer-1", name: "Lucas Gomez", email: "lucas@example.com" },
  status: "shipped",
  date: "2026-06-06T09:30:00.000Z",
  items: [{ productId: "prod-1", title: "Printer", category: "office", quantity: 2, unitPrice: 100 }],
  questions: [],
  total: 200
};

describe("dashboard state", () => {
  it("merges an updated order from a mutation response", () => {
    const orders: Order[] = [
      { ...updatedOrder, status: "packing", total: 100 },
      { ...updatedOrder, id: "ord-2", status: "paid" }
    ];

    expect(mergeUpdatedOrder(orders, updatedOrder)).toEqual([
      updatedOrder,
      { ...updatedOrder, id: "ord-2", status: "paid" }
    ]);
  });

  it("keeps priority question order status aligned with the mutation response", () => {
    const priorityQuestions: PriorityQuestion[] = [
      {
        id: "q-1",
        orderId: "ord-1",
        buyerId: "buyer-1",
        body: "Necesito seguimiento",
        status: "open",
        createdAt: "2026-06-06T10:15:00.000Z",
        replies: [],
        priority: { level: "high", score: 53, reasons: [] },
        order: {
          id: "ord-1",
          status: "packing",
          date: updatedOrder.date,
          buyer: updatedOrder.buyer,
          total: 100
        }
      }
    ];

    expect(mergeUpdatedOrderIntoPriorityQuestions(priorityQuestions, updatedOrder)[0].order).toMatchObject({
      id: "ord-1",
      status: "shipped",
      total: 200
    });
  });
});
