import type { CategoryId } from "../categories";
import { Order, PrioritizedQuestion, PriorityLevel, PriorityResult, Question } from "../types";
import { normalizeSearchText } from "./normalizeSearchText";
import { priorityConfig } from "./priorityConfig";

const levelRank: Record<PriorityLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

const riskCategories = new Set<CategoryId>(priorityConfig.riskCategoryIds);

export function getOrderTotal(order: Order): number {
  return order.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}

export function classifyQuestion(question: Question, order: Order, now = new Date()): PriorityResult {
  let score = 0;
  const reasons: string[] = [];
  const orderTotal = getOrderTotal(order);
  const waitingHours = Math.max(
    0,
    Math.floor((now.getTime() - new Date(question.createdAt).getTime()) / 3_600_000)
  );
  const body = normalizeSearchText(question.body);

  if (orderTotal >= 500000) {
    score += 30;
    reasons.push("valor alto de la orden");
  } else if (orderTotal >= 150000) {
    score += 18;
    reasons.push("valor medio de la orden");
  } else if (orderTotal >= 75000) {
    score += 10;
    reasons.push("valor de orden sobre el promedio");
  }

  if (waitingHours >= 24) {
    score += Math.min(35, Math.floor(waitingHours / 6) * 5);
    reasons.push("esperando más de 24 horas");
  } else if (waitingHours >= 8) {
    score += 10;
    reasons.push("esperando en el mismo día hábil");
  }

  if (order.status === "cancelled") {
    score += 18;
    reasons.push("orden cancelada");
  } else if (order.status === "shipped") {
    score += 12;
    reasons.push("orden en tránsito");
  } else if (order.status === "delivered") {
    score += 8;
    reasons.push("problema posterior a la entrega");
  }

  if (priorityConfig.urgentKeywords.some((keyword) => body.includes(keyword))) {
    score += 30;
    reasons.push("palabra clave crítica");
  } else if (priorityConfig.shippingKeywords.some((keyword) => body.includes(keyword))) {
    score += 15;
    reasons.push("palabra clave de envío");
  }

  if (order.items.some((item) => riskCategories.has(item.category))) {
    score += 10;
    reasons.push("categoría de riesgo");
  }

  const referencedItem = question.productId
    ? order.items.find((item) => item.productId === question.productId)
    : undefined;

  if (referencedItem && referencedItem.unitPrice >= 300000) {
    score += 6;
    reasons.push("producto referenciado de alto valor");
  }

  return {
    score,
    level: toPriorityLevel(score),
    reasons
  };
}

export function sortQuestionsByImportance(
  pairs: Array<{ question: Question; order: Order }>,
  now = new Date()
): PrioritizedQuestion[] {
  return pairs
    .filter(({ question }) => question.status !== "resolved")
    .map(({ question, order }) => ({
      question,
      order,
      priority: classifyQuestion(question, order, now)
    }))
    .sort((left, right) => {
      const levelDifference = levelRank[right.priority.level] - levelRank[left.priority.level];

      if (levelDifference !== 0) {
        return levelDifference;
      }

      const scoreDifference = right.priority.score - left.priority.score;

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return new Date(left.question.createdAt).getTime() - new Date(right.question.createdAt).getTime();
    });
}

function toPriorityLevel(score: number): PriorityLevel {
  if (score >= priorityConfig.levels.critical) {
    return "critical";
  }

  if (score >= priorityConfig.levels.high) {
    return "high";
  }

  if (score >= priorityConfig.levels.medium) {
    return "medium";
  }

  return "low";
}
