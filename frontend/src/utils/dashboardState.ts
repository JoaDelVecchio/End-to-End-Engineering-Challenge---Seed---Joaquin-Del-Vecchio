import type { Order, PriorityQuestion } from "../domain/types";
import { orderTotal } from "./orders";

export function mergeUpdatedOrder(orders: Order[], updatedOrder: Order): Order[] {
  return orders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order));
}

export function mergeUpdatedOrderIntoPriorityQuestions(
  questions: PriorityQuestion[],
  updatedOrder: Order
): PriorityQuestion[] {
  return questions.map((question) => {
    if (question.order.id !== updatedOrder.id) {
      return question;
    }

    return {
      ...question,
      order: {
        ...question.order,
        status: updatedOrder.status,
        total: orderTotal(updatedOrder)
      }
    };
  });
}
