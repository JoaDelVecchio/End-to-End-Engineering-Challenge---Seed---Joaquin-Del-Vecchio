import { useDeferredValue, useMemo, useState } from "react";
import type { OrderFilters } from "../domain/types";
import { filterOrders } from "../utils/filterOrders";
import { calculateDashboardSummary } from "../utils/orders";
import { useDashboardData } from "./useDashboardData";
import { useOrderSelection } from "./useOrderSelection";
import { useQuestionActions } from "./useQuestionActions";

export function useSellerDashboard() {
  const [filters, setFilters] = useState<OrderFilters>({ search: "", status: "all" });
  const {
    applyUpdatedOrder,
    error,
    isLoading,
    orders,
    priorityQuestions,
    refreshDashboard,
    refreshOperationalData,
    seller
  } = useDashboardData();
  const deferredFilters = useDeferredValue(filters);
  const visibleOrders = useMemo(() => filterOrders(orders, deferredFilters), [deferredFilters, orders]);
  const { selectAnyOrder, selectedOrder, selectedOrderId, selectVisibleOrder } = useOrderSelection(
    orders,
    visibleOrders
  );
  const summary = useMemo(
    () => calculateDashboardSummary(orders, priorityQuestions),
    [orders, priorityQuestions]
  );
  const questionActions = useQuestionActions({ applyUpdatedOrder, refreshDashboard: refreshOperationalData });

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
    pendingActions: questionActions.pendingActions,
    replyDrafts: questionActions.replyDrafts,
    selectAnyOrder,
    selectVisibleOrder,
    selectedOrder,
    selectedOrderId,
    setFilters,
    seller,
    summary,
    updateReplyDraft: questionActions.updateReplyDraft,
    visibleOrders
  };
}
