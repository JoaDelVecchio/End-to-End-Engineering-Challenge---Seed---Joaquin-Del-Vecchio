/// <reference types="jest" />

import type { Order, PriorityQuestion } from "../domain/types";
import { calculateDashboardSummary, orderTotal } from "./orders";

const orders: Order[] = [
  {
    id: "ord-1",
    sellerId: "seller-1",
    buyer: { id: "buyer-1", name: "Ana Perez", email: "ana@example.com" },
    status: "paid",
    date: "2026-06-06T09:30:00.000Z",
    items: [
      { productId: "prod-1", title: "Laptop", category: "electronics", quantity: 1, unitPrice: 1200 },
      { productId: "prod-2", title: "Mouse", category: "electronics", quantity: 2, unitPrice: 40 }
    ],
    questions: [
      {
        id: "q-1",
        orderId: "ord-1",
        buyerId: "buyer-1",
        body: "Broken item",
        status: "open",
        createdAt: "2026-06-06T10:00:00.000Z",
        replies: []
      }
    ]
  },
  {
    id: "ord-2",
    sellerId: "seller-1",
    buyer: { id: "buyer-2", name: "Lucas Gomez", email: "lucas@example.com" },
    status: "delivered",
    date: "2026-06-05T09:30:00.000Z",
    items: [{ productId: "prod-3", title: "Tape", category: "supplies", quantity: 3, unitPrice: 10 }],
    questions: [
      {
        id: "q-2",
        orderId: "ord-2",
        buyerId: "buyer-2",
        body: "Thanks",
        status: "resolved",
        createdAt: "2026-06-05T10:00:00.000Z",
        replies: []
      }
    ]
  }
];

const priorityQuestions = [
  {
    id: "q-1",
    priority: { level: "critical", score: 90, reasons: ["urgent keyword"] }
  }
] as PriorityQuestion[];

describe("order dashboard helpers", () => {
  it("calculates order totals from purchase-time unit prices", () => {
    expect(orderTotal(orders[0])).toBe(1280);
  });

  it("summarizes active orders, unresolved questions, critical questions, and GMV", () => {
    expect(calculateDashboardSummary(orders, priorityQuestions)).toEqual({
      activeOrders: 1,
      criticalQuestions: 1,
      openQuestions: 1,
      totalValue: 1310
    });
  });
});
