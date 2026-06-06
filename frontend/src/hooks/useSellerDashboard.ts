import { useDeferredValue, useMemo, useState } from "react";
import type { OrderFilters } from "../domain/types";
import { filterOrders } from "../utils/filterOrders";
import { calculateDashboardSummary } from "../utils/orders";
import { useDashboardData } from "./useDashboardData";
import { useOrderSelection } from "./useOrderSelection";
import { useQuestionActions } from "./useQuestionActions";

export function useSellerDashboard() {
  const [filters, setFilters] = useState<OrderFilters>({ search: "", status: "all" });
  const { error, isLoading, orders, priorityQuestions, refreshDashboard, seller } = useDashboardData();
  const deferredFilters = useDeferredValue(filters);
  const visibleOrders = useMemo(() => filterOrders(orders, deferredFilters), [deferredFilters, orders]);
  const { selectedOrder, selectedOrderId, setSelectedOrderId } = useOrderSelection(orders, visibleOrders);
  const summary = useMemo(
    () => calculateDashboardSummary(orders, priorityQuestions),
    [orders, priorityQuestions]
  );
  const questionActions = useQuestionActions(refreshDashboard);

  return {
    actionError: questionActions.actionError,
    error,
    filters,
    handleReopen: questionActions.handleReopen,
    handleReply: questionActions.handleReply,
    handleResolve: questionActions.handleResolve,
    handleTransition: questionActions.handleTransition,
    isLoading,
    loadDashboard: refreshDashboard,
    priorityQuestions,
    pendingAction: questionActions.pendingAction,
    replyDrafts: questionActions.replyDrafts,
    selectedOrder,
    selectedOrderId,
    setFilters,
    setSelectedOrderId,
    seller,
    summary,
    updateReplyDraft: questionActions.updateReplyDraft,
    visibleOrders
  };
}
