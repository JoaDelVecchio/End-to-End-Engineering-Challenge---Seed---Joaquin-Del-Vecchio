import { PRIORITY_LABELS, STATUS_LABELS } from "../constants/status";
import type { OrderStatus, PriorityLevel, Question } from "../domain/types";

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`status-badge status-${status}`}>{STATUS_LABELS[status]}</span>;
}

export function PriorityBadge({ level }: { level: PriorityLevel }) {
  return <span className={`priority-badge priority-${level}`}>{PRIORITY_LABELS[level]}</span>;
}

export function StatusDot({ status }: { status: Question["status"] }) {
  return <span className={`status-dot question-${status}`} aria-hidden="true" />;
}
