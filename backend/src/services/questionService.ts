import type { SellerDashboardStore } from "../data/storePort";
import { classifyQuestion, getOrderTotal } from "../domain/priority/classifyQuestion";
import type { Notifier } from "./notifications";
import { shouldNotifyPriority } from "./notifications";
import { assertSellerExists } from "./orderService";

export function listUnresolvedQuestionsForSeller(input: {
  store: SellerDashboardStore;
  sellerId: string;
  now: () => Date;
}) {
  assertSellerExists(input.store, input.sellerId);
  return input.store
    .listUnresolvedQuestions(input.sellerId, input.now())
    .map(({ question, order, priority }) => ({
      ...question,
      priority,
      order: {
        id: order.id,
        status: order.status,
        date: order.date,
        buyer: order.buyer,
        total: getOrderTotal(order)
      },
      product: question.productId ? order.items.find((item) => item.productId === question.productId) : undefined
    }));
}

export async function createQuestionForOrder(input: {
  store: SellerDashboardStore;
  notifier: Notifier;
  now: () => Date;
  orderId: string;
  body: string;
  productId?: string;
}) {
  const createdAt = input.now();
  const { order, question } = input.store.addQuestion({
    orderId: input.orderId,
    body: input.body,
    productId: input.productId,
    createdAt
  });
  const priority = classifyQuestion(question, order, createdAt);

  if (shouldNotifyPriority(priority.level)) {
    try {
      await input.notifier.notify({
        channel: "email",
        sellerId: order.sellerId,
        orderId: order.id,
        questionId: question.id,
        priority: priority.level,
        subject: `${priority.level.toUpperCase()} buyer question`,
        body: question.body
      });
    } catch (notificationError) {
      console.warn(
        `[notification] failed seller=${order.sellerId} order=${order.id} question=${question.id}`,
        notificationError
      );
    }
  }

  return { question: { ...question, priority } };
}

export function replyToQuestion(input: {
  store: SellerDashboardStore;
  now: () => Date;
  questionId: string;
  body: string;
}) {
  const { question } = input.store.addReply({
    questionId: input.questionId,
    body: input.body,
    createdAt: input.now()
  });

  return { question };
}

export function resolveQuestion(input: { store: SellerDashboardStore; questionId: string }) {
  const { question } = input.store.resolveQuestion(input.questionId);
  return { question };
}

export function reopenQuestion(input: { store: SellerDashboardStore; questionId: string }) {
  const { question } = input.store.reopenQuestion(input.questionId);
  return { question };
}
