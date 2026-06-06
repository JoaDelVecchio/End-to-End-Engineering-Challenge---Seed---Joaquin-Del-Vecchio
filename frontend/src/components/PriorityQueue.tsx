import { ShieldAlert } from "lucide-react";
import type { PriorityQuestion } from "../domain/types";
import { formatCurrency } from "../utils/format";
import { PriorityBadge } from "./Badges";

export function PriorityQueue({
  questions,
  onSelectOrder
}: {
  questions: PriorityQuestion[];
  onSelectOrder: (orderId: string) => void;
}) {
  return (
    <section className="queue-panel" aria-label="Cola de prioridad">
      <div className="panel-header">
        <div>
          <h2>Cola de prioridad</h2>
          <span>Preguntas sin resolver</span>
        </div>
        <ShieldAlert size={20} aria-hidden="true" />
      </div>
      <div className="queue-list">
        {questions.map((question) => (
          <button
            key={question.id}
            className={`queue-item queue-${question.priority.level}`}
            onClick={() => onSelectOrder(question.order.id)}
            type="button"
            aria-label={`Abrir pregunta de ${question.order.buyer.name} en la orden ${question.order.id}`}
          >
            <div className="queue-topline">
              <PriorityBadge level={question.priority.level} />
              <span>{question.priority.score} puntos</span>
            </div>
            <strong>{question.order.buyer.name}</strong>
            <p>{question.body}</p>
            <small>
              {question.order.id} - {formatCurrency(question.order.total)}
            </small>
          </button>
        ))}
        {questions.length === 0 ? (
          <div className="empty-state" role="status">
            No hay preguntas sin resolver
          </div>
        ) : null}
      </div>
    </section>
  );
}
