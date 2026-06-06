import type { OrderStatus, PriorityLevel, QuestionStatus } from "../domain/types";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Nueva",
  paid: "Pagada",
  packing: "En preparación",
  shipped: "Enviada",
  delivered: "Entregada",
  cancelled: "Cancelada"
};

export const QUESTION_STATUS_LABELS: Record<QuestionStatus, string> = {
  open: "Abierta",
  answered: "Respondida",
  resolved: "Resuelta"
};

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica"
};

export const NEXT_PRIMARY_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  new: "paid",
  paid: "packing",
  packing: "shipped",
  shipped: "delivered"
};
