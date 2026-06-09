import { useCallback, useRef, useState } from "react";
import { reopenQuestion, replyToQuestion, resolveQuestion, transitionOrder } from "../api/sellerDashboardApi";
import type { FormEvent } from "react";
import type { Order, OrderStatus, Question } from "../domain/types";

export function useQuestionActions({
  applyUpdatedOrder,
  refreshDashboard
}: {
  applyUpdatedOrder: (order: Order) => void;
  refreshDashboard: () => Promise<void>;
}) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingActions, setPendingActions] = useState<string[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const runningLocksRef = useRef(new Set<string>());

  const updateReplyDraft = useCallback((questionId: string, value: string) => {
    setActionError(null);
    setReplyDrafts((current) => ({ ...current, [questionId]: value }));
  }, []);

  const runAction = useCallback(async (actionKey: string, lockKey: string, action: () => Promise<void>) => {
    if (runningLocksRef.current.has(lockKey)) {
      return;
    }

    runningLocksRef.current.add(lockKey);
    setActionError(null);
    setPendingActions((current) => [...current, actionKey]);

    try {
      await action();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No pudimos completar la acción.");
    } finally {
      runningLocksRef.current.delete(lockKey);
      setPendingActions((current) => current.filter((key) => key !== actionKey));
    }
  }, []);

  const handleReply = useCallback(
    async (question: Question, event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const body = replyDrafts[question.id]?.trim();

      if (!body) {
        return;
      }

      await runAction(`reply:${question.id}`, `question:${question.id}`, async () => {
        await replyToQuestion(question.id, body);
        setReplyDrafts((current) => ({ ...current, [question.id]: "" }));
        await refreshDashboard();
      });
    },
    [refreshDashboard, replyDrafts, runAction]
  );

  const handleResolve = useCallback(
    async (questionId: string) => {
      await runAction(`resolve:${questionId}`, `question:${questionId}`, async () => {
        await resolveQuestion(questionId);
        await refreshDashboard();
      });
    },
    [refreshDashboard, runAction]
  );

  const handleReopen = useCallback(
    async (questionId: string) => {
      await runAction(`reopen:${questionId}`, `question:${questionId}`, async () => {
        await reopenQuestion(questionId);
        await refreshDashboard();
      });
    },
    [refreshDashboard, runAction]
  );

  const handleTransition = useCallback(
    async (order: Order, status: OrderStatus) => {
      await runAction(`transition:${order.id}:${status}`, `order:${order.id}`, async () => {
        const updatedOrder = await transitionOrder(order.id, status, order.status);
        applyUpdatedOrder(updatedOrder);
      });
    },
    [applyUpdatedOrder, runAction]
  );

  return {
    actionError,
    handleReopen,
    handleReply,
    handleResolve,
    handleTransition,
    pendingActions,
    replyDrafts,
    updateReplyDraft
  };
}
