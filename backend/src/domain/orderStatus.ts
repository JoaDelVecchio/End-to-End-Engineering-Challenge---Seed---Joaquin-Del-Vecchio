import { OrderStatus } from "./types";

export const ORDER_STATUSES = ["new", "paid", "packing", "shipped", "delivered", "cancelled"] as const;

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  new: ["paid"],
  paid: ["packing", "cancelled"],
  packing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: []
};

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function transitionOrderStatus(from: OrderStatus, to: OrderStatus): OrderStatus {
  if (!canTransitionOrderStatus(from, to)) {
    throw new Error(`Invalid order status transition from ${from} to ${to}`);
  }

  return to;
}
