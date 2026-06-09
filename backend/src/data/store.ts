import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { transitionOrderStatus } from "../domain/orderStatus";
import { getOrderTotal, sortQuestionsByImportance } from "../domain/priority/classifyQuestion";
import { StoreError } from "../errors/StoreError";
import {
  Order,
  OrderStatus,
  PrioritizedQuestion,
  Question,
  Seller,
  StoreData
} from "../domain/types";
import { createSeedData } from "./seedData";
import type { AddQuestionInput, AddReplyInput, OrderFilters, SellerDashboardStore } from "./storePort";

export class InMemoryStore implements SellerDashboardStore {
  protected data: StoreData;

  constructor(data: StoreData) {
    this.data = clone(data);
  }

  snapshot(): StoreData {
    return clone(this.data);
  }

  listSellers(): Seller[] {
    return clone(this.data.sellers);
  }

  getSeller(sellerId: string): Seller | undefined {
    return clone(this.data.sellers.find((seller) => seller.id === sellerId));
  }

  listOrders(sellerId: string, filters: OrderFilters = {}): Order[] {
    const buyerTokens = filters.buyer
      ?.toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    const fromTime = filters.from ? new Date(filters.from).getTime() : undefined;
    const toTime = filters.to ? new Date(filters.to).getTime() : undefined;

    return clone(
      this.data.orders
        .filter((order) => order.sellerId === sellerId)
        .filter((order) => (filters.status ? order.status === filters.status : true))
        .filter((order) => {
          if (!buyerTokens?.length) {
            return true;
          }

          const haystack = `${order.buyer.name} ${order.buyer.email}`.toLowerCase();
          return buyerTokens.every((token) => haystack.includes(token));
        })
        .filter((order) => {
          const orderTime = new Date(order.date).getTime();
          return (fromTime === undefined || orderTime >= fromTime) && (toTime === undefined || orderTime <= toTime);
        })
        .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    );
  }

  getOrder(orderId: string): Order | undefined {
    return clone(this.findOrder(orderId));
  }

  listUnresolvedQuestions(sellerId: string, now = new Date()): PrioritizedQuestion[] {
    const pairs = this.data.orders
      .filter((order) => order.sellerId === sellerId)
      .flatMap((order) => order.questions.map((question) => ({ question, order })));

    return clone(sortQuestionsByImportance(pairs, now));
  }

  addQuestion(input: AddQuestionInput): { order: Order; question: Question } {
    const order = this.requireOrder(input.orderId);

    if (input.productId && !order.items.some((item) => item.productId === input.productId)) {
      throw new StoreError(400, "PRODUCT_NOT_IN_ORDER", "Product is not part of this order");
    }

    const question: Question = {
      id: randomUUID(),
      orderId: order.id,
      buyerId: order.buyer.id,
      productId: input.productId,
      body: input.body,
      status: "open",
      createdAt: input.createdAt.toISOString(),
      replies: []
    };

    order.questions.push(question);
    this.persist();

    return { order: clone(order), question: clone(question) };
  }

  addReply(input: AddReplyInput): { order: Order; question: Question } {
    const { order, question } = this.requireQuestion(input.questionId);

    if (question.status === "resolved") {
      throw new StoreError(409, "QUESTION_ALREADY_RESOLVED", "Cannot reply to a resolved question");
    }

    question.replies.push({
      id: randomUUID(),
      author: "seller",
      body: input.body,
      createdAt: input.createdAt.toISOString()
    });
    question.status = "answered";
    this.persist();

    return { order: clone(order), question: clone(question) };
  }

  resolveQuestion(questionId: string): { order: Order; question: Question } {
    const { order, question } = this.requireQuestion(questionId);
    question.status = "resolved";
    this.persist();

    return { order: clone(order), question: clone(question) };
  }

  reopenQuestion(questionId: string): { order: Order; question: Question } {
    const { order, question } = this.requireQuestion(questionId);

    if (question.status !== "resolved") {
      throw new StoreError(409, "QUESTION_NOT_RESOLVED", "Only resolved questions can be reopened");
    }

    question.status = "open";
    this.persist();

    return { order: clone(order), question: clone(question) };
  }

  transitionOrder(orderId: string, status: OrderStatus, previousStatus?: OrderStatus): Order {
    const order = this.requireOrder(orderId);
    try {
      order.status = transitionOrderStatus(order.status, status, previousStatus);
    } catch (error) {
      throw new StoreError(
        409,
        "INVALID_ORDER_TRANSITION",
        error instanceof Error ? error.message : "Invalid order status transition"
      );
    }
    this.persist();

    return clone(order);
  }

  orderTotal(orderId: string): number {
    const order = this.requireOrder(orderId);
    return getOrderTotal(order);
  }

  protected persist(): void {
    return;
  }

  private findOrder(orderId: string): Order | undefined {
    return this.data.orders.find((order) => order.id === orderId);
  }

  private requireOrder(orderId: string): Order {
    const order = this.findOrder(orderId);

    if (!order) {
      throw new StoreError(404, "ORDER_NOT_FOUND", `Order ${orderId} not found`);
    }

    return order;
  }

  private requireQuestion(questionId: string): { order: Order; question: Question } {
    for (const order of this.data.orders) {
      const question = order.questions.find((candidate) => candidate.id === questionId);

      if (question) {
        return { order, question };
      }
    }

    throw new StoreError(404, "QUESTION_NOT_FOUND", `Question ${questionId} not found`);
  }
}

export class JsonFileStore extends InMemoryStore {
  constructor(data: StoreData, private readonly filePath = defaultStorePath()) {
    super(data);
  }

  static load(filePath = defaultStorePath()): JsonFileStore {
    if (!fs.existsSync(filePath)) {
      writeSeedFile(filePath);
    }

    const data = withSeedDefaults(JSON.parse(fs.readFileSync(filePath, "utf8")) as StoreData);
    return new JsonFileStore(data, filePath);
  }

  protected override persist(): void {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.writeFileSync(this.filePath, `${JSON.stringify(this.snapshot(), null, 2)}\n`);
  }
}

export function writeSeedFile(filePath = defaultStorePath()): StoreData {
  const data = createSeedData();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
  return data;
}

export { StoreError };
export type { OrderFilters, SellerDashboardStore };

export function defaultStorePath(): string {
  return path.resolve(process.cwd(), "data", "store.json");
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function withSeedDefaults(data: StoreData): StoreData {
  const seed = createSeedData();
  const sellers = data.sellers.map((seller) => ({
    ...seller,
    reputation:
      seller.reputation ??
      seed.sellers.find((seedSeller) => seedSeller.id === seller.id)?.reputation ??
      "MercadoLíder"
  }));

  return { sellers, orders: data.orders };
}
