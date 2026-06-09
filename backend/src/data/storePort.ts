import type { Order, OrderStatus, PrioritizedQuestion, Question, Seller } from "../domain/types";

export interface OrderFilters {
  status?: OrderStatus;
  buyer?: string;
  from?: string;
  to?: string;
}

export interface AddQuestionInput {
  orderId: string;
  body: string;
  productId?: string;
  createdAt: Date;
}

export interface AddReplyInput {
  questionId: string;
  body: string;
  createdAt: Date;
}

export interface SellerDashboardStore {
  getSeller(sellerId: string): Seller | undefined;
  listOrders(sellerId: string, filters?: OrderFilters): Order[];
  listUnresolvedQuestions(sellerId: string, now?: Date): PrioritizedQuestion[];
  addQuestion(input: AddQuestionInput): { order: Order; question: Question };
  addReply(input: AddReplyInput): { order: Order; question: Question };
  resolveQuestion(questionId: string): { order: Order; question: Question };
  reopenQuestion(questionId: string): { order: Order; question: Question };
  transitionOrder(orderId: string, status: OrderStatus, previousStatus?: OrderStatus): Order;
}
