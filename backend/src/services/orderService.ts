import type { OrderFilters, SellerDashboardStore } from "../data/storePort";
import type { Order, OrderStatus } from "../domain/types";
import { StoreError } from "../errors/StoreError";

export function listOrdersForSeller(input: {
  store: SellerDashboardStore;
  sellerId: string;
  filters: OrderFilters;
}): Array<Order & { total: number }> {
  assertSellerExists(input.store, input.sellerId);
  return input.store.listOrders(input.sellerId, input.filters).map((order) => enrichOrder(order));
}

export function transitionOrder(input: {
  store: SellerDashboardStore;
  orderId: string;
  previousStatus?: OrderStatus;
  status: OrderStatus;
}): Order & { total: number } {
  return enrichOrder(input.store.transitionOrder(input.orderId, input.status, input.previousStatus));
}

export function enrichOrder<T extends { items: Array<{ quantity: number; unitPrice: number }> }>(
  order: T
): T & { total: number } {
  return {
    ...order,
    total: order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  };
}

export function assertSellerExists(store: SellerDashboardStore, sellerId: string): void {
  if (!store.getSeller(sellerId)) {
    throw new StoreError(404, "SELLER_NOT_FOUND", `Seller ${sellerId} not found`);
  }
}
