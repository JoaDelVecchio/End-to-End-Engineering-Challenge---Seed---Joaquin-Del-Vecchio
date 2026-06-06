import { canTransitionOrderStatus, transitionOrderStatus } from "./orderStatus";

describe("order status transitions", () => {
  it("allows valid lifecycle transitions", () => {
    expect(canTransitionOrderStatus("new", "paid")).toBe(true);
    expect(canTransitionOrderStatus("paid", "packing")).toBe(true);
    expect(canTransitionOrderStatus("packing", "shipped")).toBe(true);
    expect(canTransitionOrderStatus("shipped", "delivered")).toBe(true);
  });

  it("rejects invalid lifecycle transitions", () => {
    expect(canTransitionOrderStatus("new", "delivered")).toBe(false);
    expect(() => transitionOrderStatus("delivered", "paid")).toThrow(
      "Invalid order status transition from delivered to paid"
    );
  });
});
