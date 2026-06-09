/// <reference types="jest" />

import type { Order } from "../domain/types";
import { request } from "./httpClient";
import { transitionOrder } from "./sellerDashboardApi";

jest.mock("./httpClient", () => ({
  request: jest.fn()
}));

const requestMock = request as jest.MockedFunction<typeof request>;

const order: Order = {
  id: "ord-1",
  sellerId: "seller-1",
  buyer: { id: "buyer-1", name: "Lucas Gomez", email: "lucas@example.com" },
  status: "shipped",
  date: "2026-06-06T09:30:00.000Z",
  items: [],
  questions: []
};

describe("sellerDashboardApi", () => {
  beforeEach(() => {
    requestMock.mockReset();
  });

  it("sends the previous visible status when transitioning an order", async () => {
    requestMock.mockResolvedValue({ order });

    await expect(transitionOrder("ord-1", "shipped", "packing")).resolves.toBe(order);

    expect(requestMock).toHaveBeenCalledWith("/orders/ord-1/status", {
      method: "PATCH",
      body: JSON.stringify({ previousStatus: "packing", status: "shipped" })
    });
  });
});
