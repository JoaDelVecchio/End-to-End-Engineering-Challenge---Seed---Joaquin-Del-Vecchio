import { CheckCircle2, MessageSquare, Send } from "lucide-react";
import type { FormEvent } from "react";
import { QUESTION_STATUS_LABELS } from "../../constants/status";
import type { Order, Question } from "../../domain/types";
import { formatDate } from "../../utils/format";
import { productTitle } from "../../utils/orders";
import { StatusDot } from "../Badges";
import { ConfirmableAction } from "../ConfirmableAction";

export function QuestionThread({
  order,
  pendingActions,
  replyDrafts,
  onReplyDraftChange,
  onReopen,
  onReply,
  onResolve
}: {
  order: Order;
  pendingActions: string[];
  replyDrafts: Record<string, string>;
  onReplyDraftChange: (questionId: string, value: string) => void;
  onReopen: (questionId: string) => Promise<void>;
  onReply: (question: Question, event: FormEvent<HTMLFormElement>) => Promise<void>;
  onResolve: (questionId: string) => Promise<void>;
}) {
  return (
    <section className="questions-panel" aria-label="Preguntas de compradores">
      <div className="subsection-title">
        <MessageSquare size={18} aria-hidden="true" />
        <h3>Preguntas</h3>
      </div>
      <div className="thread-list">
        {order.questions.map((question) => {
          const replyDraft = replyDrafts[question.id] ?? "";
          const replyActionKey = `reply:${question.id}`;
          const resolveActionKey = `resolve:${question.id}`;
          const reopenActionKey = `reopen:${question.id}`;
          const isReplyPending = pendingActions.includes(replyActionKey);
          const isResolvePending = pendingActions.includes(resolveActionKey);
          const isReopenPending = pendingActions.includes(reopenActionKey);
          const isQuestionPending = isReplyPending || isResolvePending || isReopenPending;
          const canReply = replyDraft.trim().length > 0;

          return (
            <article className="question-thread" key={question.id} aria-busy={isQuestionPending}>
              <div className="question-heading">
                <StatusDot status={question.status} />
                <strong>{QUESTION_STATUS_LABELS[question.status]}</strong>
                <span>{formatDate(question.createdAt)}</span>
              </div>
              <p>{question.body}</p>
              {question.productId ? <small>Producto: {productTitle(order, question.productId)}</small> : null}
              <div className="reply-list">
                {question.replies.map((reply) => (
                  <div className="reply" key={reply.id}>
                    <CheckCircle2 size={15} aria-hidden="true" />
                    <span>{reply.body}</span>
                  </div>
                ))}
              </div>
              {question.status !== "resolved" ? (
                <form className="reply-form" onSubmit={(event) => onReply(question, event)}>
                  <textarea
                    value={replyDraft}
                    disabled={isQuestionPending}
                    onChange={(event) => onReplyDraftChange(question.id, event.target.value)}
                    placeholder="Escribe una respuesta al comprador"
                    aria-label={`Responder pregunta ${question.id}`}
                  />
                  <div className="reply-actions">
                    <ConfirmableAction
                      key={`${question.id}:${question.status}`}
                      variant="secondary"
                      disabled={isQuestionPending}
                      isPending={isResolvePending}
                      triggerLabel="Resolver"
                      pendingLabel="Resolviendo"
                      confirmTitle="Confirmar resolución"
                      confirmDescription="La pregunta saldrá de la cola de prioridad."
                      onConfirm={() => onResolve(question.id)}
                    />
                    <button
                      className="primary-button"
                      disabled={isQuestionPending || !canReply}
                      type="submit"
                      aria-busy={isReplyPending}
                    >
                      <Send size={16} aria-hidden="true" />
                      {isReplyPending ? "Enviando" : "Responder"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="reply-actions">
                  <button
                    className="secondary-button"
                    disabled={isQuestionPending}
                    type="button"
                    onClick={() => onReopen(question.id)}
                    aria-busy={isReopenPending}
                  >
                    {isReopenPending ? "Reabriendo" : "Reabrir"}
                  </button>
                </div>
              )}
            </article>
          );
        })}
        {order.questions.length === 0 ? (
          <div className="empty-state" role="status">
            Esta orden no tiene preguntas de compradores
          </div>
        ) : null}
      </div>
    </section>
  );
}
