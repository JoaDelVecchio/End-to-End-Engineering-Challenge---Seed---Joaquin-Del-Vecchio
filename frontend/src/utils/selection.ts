import type { Order } from "../domain/types";

export function selectPreferredOrder(
  allOrders: Order[],
  visibleOrders: Order[],
  selectedOrderId?: string,
  options: { includeHiddenSelected?: boolean } = {}
): Order | undefined {
  const selectedVisibleOrder = visibleOrders.find((order) => order.id === selectedOrderId);
  const selectedHiddenOrder = options.includeHiddenSelected
    ? allOrders.find((order) => order.id === selectedOrderId)
    : undefined;

  return (
    selectedVisibleOrder ??
    selectedHiddenOrder ??
    visibleOrders[0] ??
    allOrders[0]
  );
}
