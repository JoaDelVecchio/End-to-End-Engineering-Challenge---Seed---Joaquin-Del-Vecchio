/// <reference types="jest" />

import { renderToStaticMarkup } from "react-dom/server";
import type { Order } from "../../domain/types";
import { OrderDetailHeader } from "./OrderDetailHeader";

const paidOrder: Order = {
  id: "ord-1",
  sellerId: "seller-1",
  buyer: { id: "buyer-1", name: "Ana Perez", email: "ana@example.com" },
  status: "paid",
  date: "2026-06-04T10:00:00.000Z",
  items: [{ productId: "prod-1", title: "Laptop", category: "electronics", quantity: 1, unitPrice: 1200000 }],
  questions: []
};

describe("OrderDetailHeader", () => {
  it("offers cancellation for paid orders alongside the primary flow", () => {
    const html = renderToStaticMarkup(
      <OrderDetailHeader order={paidOrder} pendingActions={[]} onTransition={jest.fn()} />
    );

    expect(html).toContain("Marcar como en preparación");
    expect(html).toContain("Cancelar orden");
  });

  it("does not offer cancellation for delivered orders", () => {
    const html = renderToStaticMarkup(
      <OrderDetailHeader order={{ ...paidOrder, status: "delivered" }} pendingActions={[]} onTransition={jest.fn()} />
    );

    expect(html).not.toContain("Cancelar orden");
  });
});
