import type { Order, OrderStatus, PriorityQuestion, Question, Seller } from "../domain/types";
import { request } from "./httpClient";

export async function fetchSeller(sellerId: string, signal?: AbortSignal): Promise<Seller> {
  const data = await request<{ seller: Seller }>(`/sellers/${sellerId}`, { signal });
  return data.seller;
}

export async function fetchOrders(sellerId: string, signal?: AbortSignal): Promise<Order[]> {
  const data = await request<{ orders: Order[] }>(`/sellers/${sellerId}/orders`, { signal });
  return data.orders;
}

export async function fetchPriorityQuestions(sellerId: string, signal?: AbortSignal): Promise<PriorityQuestion[]> {
  const data = await request<{ questions: PriorityQuestion[] }>(`/sellers/${sellerId}/questions/unresolved`, {
    signal
  });
  return data.questions;
}

export async function replyToQuestion(questionId: string, body: string): Promise<Question> {
  const data = await request<{ question: Question }>(`/questions/${questionId}/replies`, {
    method: "POST",
    body: JSON.stringify({ body })
  });
  return data.question;
}

export async function resolveQuestion(questionId: string): Promise<Question> {
  const data = await request<{ question: Question }>(`/questions/${questionId}/resolve`, {
    method: "PATCH"
  });
  return data.question;
}

export async function reopenQuestion(questionId: string): Promise<Question> {
  const data = await request<{ question: Question }>(`/questions/${questionId}/reopen`, {
    method: "PATCH"
  });
  return data.question;
}

export async function transitionOrder(
  orderId: string,
  status: OrderStatus,
  previousStatus?: OrderStatus
): Promise<Order> {
  const data = await request<{ order: Order }>(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ previousStatus, status })
  });
  return data.order;
}
