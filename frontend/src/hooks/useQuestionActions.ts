import { useCallback, useRef, useState } from "react";
import { reopenQuestion, replyToQuestion, resolveQuestion, transitionOrder } from "../api/sellerDashboardApi";
import type { FormEvent } from "react";
import type { Order, OrderStatus, Question } from "../domain/types";

export function useQuestionActions(refreshDashboard: () => Promise<void>) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const isActionRunningRef = useRef(false);

  const updateReplyDraft = useCallback((questionId: string, value: string) => {
    setActionError(null);
    setReplyDrafts((current) => ({ ...current, [questionId]: value }));
  }, []);

  const runAction = useCallback(async (actionKey: string, action: () => Promise<void>) => {
    if (isActionRunningRef.current) {
      return;
    }

    isActionRunningRef.current = true;
    setActionError(null);
    setPendingAction(actionKey);

    try {
      await action();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No pudimos completar la acción.");
    } finally {
      isActionRunningRef.current = false;
      setPendingAction(null);
    }
  }, []);

  const handleReply = useCallback(
    async (question: Question, event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const body = replyDrafts[question.id]?.trim();

      if (!body) {
        return;
      }

      await runAction(`reply:${question.id}`, async () => {
        await replyToQuestion(question.id, body);
        setReplyDrafts((current) => ({ ...current, [question.id]: "" }));
        await refreshDashboard();
      });
    },
    [refreshDashboard, replyDrafts, runAction]
  );

  const handleResolve = useCallback(
    async (questionId: string) => {
      await runAction(`resolve:${questionId}`, async () => {
        await resolveQuestion(questionId);
        await refreshDashboard();
      });
    },
    [refreshDashboard, runAction]
  );

  const handleReopen = useCallback(
    async (questionId: string) => {
      await runAction(`reopen:${questionId}`, async () => {
        await reopenQuestion(questionId);
        await refreshDashboard();
      });
    },
    [refreshDashboard, runAction]
  );

  const handleTransition = useCallback(
    async (order: Order, status: OrderStatus) => {
      await runAction(`transition:${order.id}:${status}`, async () => {
        await transitionOrder(order.id, status);
        await refreshDashboard();
      });
    },
    [refreshDashboard, runAction]
  );

  return {
    actionError,
    handleReopen,
    handleReply,
    handleResolve,
    handleTransition,
    pendingAction,
    replyDrafts,
    updateReplyDraft
  };
}
