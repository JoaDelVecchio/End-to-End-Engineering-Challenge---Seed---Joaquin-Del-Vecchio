import { routeParam } from "./routeParams";

describe("route params", () => {
  it("returns string route params and first array values", () => {
    expect(routeParam({ orderId: "ord-1" }, "orderId")).toBe("ord-1");
    expect(routeParam({ orderId: ["ord-1", "ord-2"] }, "orderId")).toBe("ord-1");
  });

  it("rejects missing route params as controlled API errors", () => {
    expect(() => routeParam({}, "orderId")).toThrow("Missing route parameter: orderId");
  });
});
