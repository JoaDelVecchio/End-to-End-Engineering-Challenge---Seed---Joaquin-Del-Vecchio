import { InMemoryStore } from "../data/store";
import { createSeedData } from "../data/seedData";
import { listOrdersForSeller, transitionOrder } from "./orderService";

describe("order service", () => {
  it("returns enriched order totals from backend data", () => {
    const store = new InMemoryStore(createSeedData());

    const orders = listOrdersForSeller({ store, sellerId: "seller-1", filters: { buyer: "ana" } });

    expect(orders).toHaveLength(1);
    expect(orders[0]).toMatchObject({
      id: "ord-1002",
      total: 1278000
    });
  });

  it("transitions orders through the domain lifecycle", () => {
    const store = new InMemoryStore(createSeedData());

    const order = transitionOrder({ store, orderId: "ord-1001", status: "packing" });

    expect(order.status).toBe("packing");
    expect(order.total).toBe(216000);
  });

  it("rejects listing orders for an unknown seller", () => {
    const store = new InMemoryStore(createSeedData());

    expect(() => listOrdersForSeller({ store, sellerId: "missing-seller", filters: {} })).toThrow(
      "Seller missing-seller not found"
    );
  });
});
