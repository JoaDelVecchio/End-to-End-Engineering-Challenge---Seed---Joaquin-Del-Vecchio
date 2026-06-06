import type { Order } from "../domain/types";

export function selectPreferredOrder(
  allOrders: Order[],
  visibleOrders: Order[],
  selectedOrderId?: string
): Order | undefined {
  return (
    allOrders.find((order) => order.id === selectedOrderId) ??
    visibleOrders.find((order) => order.id === selectedOrderId) ??
    visibleOrders[0] ??
    allOrders[0]
  );
}

export function selectVisibleOrderId(visibleOrders: Order[], selectedOrderId?: string): string | undefined {
  if (visibleOrders.length === 0) {
    return undefined;
  }

  return visibleOrders.some((order) => order.id === selectedOrderId)
    ? selectedOrderId
    : visibleOrders[0].id;
}
