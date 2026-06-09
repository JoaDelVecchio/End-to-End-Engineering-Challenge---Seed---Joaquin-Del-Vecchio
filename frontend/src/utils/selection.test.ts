/// <reference types="jest" />

import type { Order } from "../domain/types";
import { selectPreferredOrder } from "./selection";

function order(id: string, date: string): Order {
  return {
    id,
    sellerId: "seller-1",
    buyer: { id: "buyer-1", name: "Ana Perez", email: "ana@example.com" },
    status: "paid",
    date,
    items: [],
    questions: []
  };
}

const orders = [
  order("ord-1", "2026-06-06T09:30:00.000Z"),
  order("ord-2", "2026-06-05T09:30:00.000Z")
];

describe("order selection helpers", () => {
  it("keeps the selected order when it is still visible", () => {
    expect(selectPreferredOrder(orders, orders, "ord-2")?.id).toBe("ord-2");
  });

  it("falls back to the first visible order when filters hide a table selection", () => {
    const visibleOrders = [orders[0]];

    expect(selectPreferredOrder(orders, visibleOrders, "ord-2")?.id).toBe("ord-1");
  });

  it("can select a loaded order from the priority queue even when filters hide it", () => {
    const visibleOrders = [orders[0]];

    expect(selectPreferredOrder(orders, visibleOrders, "ord-2", { includeHiddenSelected: true })?.id).toBe("ord-2");
  });

  it("falls back to the first loaded order when no order is visible", () => {
    expect(selectPreferredOrder(orders, [], "ord-3")?.id).toBe("ord-1");
  });
});
