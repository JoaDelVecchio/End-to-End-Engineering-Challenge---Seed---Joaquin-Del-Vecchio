/// <reference types="jest" />

import type { Order } from "../domain/types";
import { filterOrders } from "./filterOrders";

const orders: Order[] = [
  {
    id: "ord-1",
    sellerId: "seller-1",
    buyer: { id: "buyer-1", name: "Ana Perez", email: "ana@example.com" },
    status: "shipped",
    date: "2026-06-04T10:00:00.000Z",
    items: [
      { productId: "prod-1", title: "Laptop Ultra", category: "electronics", quantity: 1, unitPrice: 1200000 }
    ],
    questions: []
  },
  {
    id: "ord-2",
    sellerId: "seller-1",
    buyer: { id: "buyer-2", name: "Lucas Gomez", email: "lucas@example.com" },
    status: "paid",
    date: "2026-06-05T13:00:00.000Z",
    items: [{ productId: "prod-2", title: "Tape pack", category: "supplies", quantity: 2, unitPrice: 85000 }],
    questions: []
  }
];

describe("filterOrders", () => {
  it("filters by buyer, status, and product text without mutating the source list", () => {
    const result = filterOrders(orders, {
      search: "laptop ana",
      status: "shipped"
    });

    expect(result.map((order) => order.id)).toEqual(["ord-1"]);
    expect(orders).toHaveLength(2);
  });

  it("returns every order when filters are empty", () => {
    expect(filterOrders(orders, { search: "", status: "all" })).toEqual(orders);
  });

  it("includes every order from the selected end date", () => {
    const result = filterOrders(orders, {
      search: "",
      status: "all",
      from: "2026-06-05",
      to: "2026-06-05"
    });

    expect(result.map((order) => order.id)).toEqual(["ord-2"]);
  });

  it("ignores invalid date filters instead of hiding valid orders", () => {
    const result = filterOrders(orders, {
      search: "",
      status: "all",
      from: "not-a-date",
      to: "also-invalid"
    });

    expect(result.map((order) => order.id)).toEqual(["ord-1", "ord-2"]);
  });
});
