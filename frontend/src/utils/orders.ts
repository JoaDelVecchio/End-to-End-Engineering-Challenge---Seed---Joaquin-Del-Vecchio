import type { Order, PriorityQuestion } from "../domain/types";

export interface DashboardSummary {
  activeOrders: number;
  criticalQuestions: number;
  openQuestions: number;
  totalValue: number;
}

export function calculateDashboardSummary(orders: Order[], questions: PriorityQuestion[]): DashboardSummary {
  return {
    openQuestions: orders.reduce(
      (total, order) => total + order.questions.filter((question) => question.status !== "resolved").length,
      0
    ),
    criticalQuestions: questions.filter((question) => question.priority.level === "critical").length,
    activeOrders: orders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length,
    totalValue: orders.reduce((total, order) => total + orderTotal(order), 0)
  };
}

export function orderTotal(order: Order): number {
  return order.total ?? order.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}

export function productTitle(order: Order, productId: string): string {
  return order.items.find((item) => item.productId === productId)?.title ?? productId;
}

export function orderUnitCount(order: Order): number {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}
