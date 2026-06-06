import { Order, PrioritizedQuestion, PriorityLevel, PriorityResult, Question } from "./types";

const levelRank: Record<PriorityLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

const urgentKeywords = [
  "refund",
  "return",
  "broken",
  "damaged",
  "wrong",
  "missing",
  "cancel",
  "claim",
  "urgent",
  "late",
  "not arrived",
  "devolucion",
  "reembolso",
  "devolver",
  "reintegro",
  "problema",
  "reclamo",
  "roto",
  "rota",
  "rotos",
  "rotas",
  "danado",
  "danada",
  "danados",
  "danadas",
  "falla",
  "fallo",
  "defectuoso",
  "defectuosa",
  "no funciona",
  "equivocado",
  "equivocada",
  "incorrecto",
  "incorrecta",
  "cancelar",
  "cancelacion",
  "urgente",
  "no recibi",
  "falta"
];

const shippingKeywords = [
  "shipping",
  "delivery",
  "delivered",
  "address",
  "envio",
  "entrega",
  "despacho",
  "seguimiento",
  "direccion",
  "domicilio",
  "paquete",
  "no llego",
  "correo",
  "transportista",
  "demora",
  "demorado",
  "tarde"
];

const riskCategories = new Set(["electronics", "auto-parts", "automotive", "appliances"]);

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

  if (orderTotal >= 500) {
    score += 30;
    reasons.push("valor alto de la orden");
  } else if (orderTotal >= 150) {
    score += 18;
    reasons.push("valor medio de la orden");
  } else if (orderTotal >= 75) {
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

  if (urgentKeywords.some((keyword) => body.includes(keyword))) {
    score += 30;
    reasons.push("palabra clave crítica");
  } else if (shippingKeywords.some((keyword) => body.includes(keyword))) {
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

  if (referencedItem && referencedItem.unitPrice >= 300) {
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
  if (score >= 75) {
    return "critical";
  }

  if (score >= 50) {
    return "high";
  }

  if (score >= 25) {
    return "medium";
  }

  return "low";
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
