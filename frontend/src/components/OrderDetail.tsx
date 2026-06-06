import type { FormEvent } from "react";
import type { Order, OrderStatus, Question } from "../domain/types";
import { OrderDetailHeader } from "./OrderDetailHeader";
import { OrderItems } from "./OrderItems";
import { QuestionThread } from "./QuestionThread/QuestionThread";

export function OrderDetail({
  order,
  pendingAction,
  replyDrafts,
  onReplyDraftChange,
  onReopen,
  onReply,
  onResolve,
  onTransition
}: {
  order?: Order;
  pendingAction?: string | null;
  replyDrafts: Record<string, string>;
  onReplyDraftChange: (questionId: string, value: string) => void;
  onReopen: (questionId: string) => Promise<void>;
  onReply: (question: Question, event: FormEvent<HTMLFormElement>) => Promise<void>;
  onResolve: (questionId: string) => Promise<void>;
  onTransition: (order: Order, status: OrderStatus) => Promise<void>;
}) {
  if (!order) {
    return <section className="detail-panel empty-state">Selecciona una orden</section>;
  }

  return (
    <section className="detail-panel" aria-label="Detalle de la orden seleccionada">
      <OrderDetailHeader order={order} pendingAction={pendingAction} onTransition={onTransition} />
      <div className="detail-grid">
        <OrderItems order={order} />
        <QuestionThread
          order={order}
          pendingAction={pendingAction}
          replyDrafts={replyDrafts}
          onReplyDraftChange={onReplyDraftChange}
          onReopen={onReopen}
          onReply={onReply}
          onResolve={onResolve}
        />
      </div>
    </section>
  );
}
