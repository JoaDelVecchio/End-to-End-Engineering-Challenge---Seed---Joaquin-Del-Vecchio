import { OrderStatus } from "./types";

export const ORDER_STATUSES = ["new", "paid", "packing", "shipped", "delivered", "cancelled"] as const;

const primaryWorkflow: OrderStatus[] = ["new", "paid", "packing", "shipped", "delivered"];

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

export function transitionOrderStatus(from: OrderStatus, to: OrderStatus, previousStatus?: OrderStatus): OrderStatus {
  if (!canTransitionOrderStatus(from, to) && !canReconcileClientTransition(from, to, previousStatus)) {
    throw new Error(`Invalid order status transition from ${from} to ${to}`);
  }

  return to;
}

function canReconcileClientTransition(
  currentStatus: OrderStatus,
  targetStatus: OrderStatus,
  previousStatus?: OrderStatus
): boolean {
  if (!previousStatus || !canTransitionOrderStatus(previousStatus, targetStatus)) {
    return false;
  }

  return canReachPrimaryStatus(currentStatus, previousStatus);
}

function canReachPrimaryStatus(from: OrderStatus, to: OrderStatus): boolean {
  const fromIndex = primaryWorkflow.indexOf(from);
  const toIndex = primaryWorkflow.indexOf(to);

  return fromIndex >= 0 && toIndex >= 0 && fromIndex <= toIndex;
}
