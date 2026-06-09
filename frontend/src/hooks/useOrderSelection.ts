import { useCallback, useMemo, useState } from "react";
import type { Order } from "../domain/types";
import { selectPreferredOrder } from "../utils/selection";

interface SelectedOrderState {
  includeHiddenSelected: boolean;
  orderId?: string;
}

export function useOrderSelection(allOrders: Order[], visibleOrders: Order[]) {
  const [selection, setSelection] = useState<SelectedOrderState>({ includeHiddenSelected: false });

  const selectedOrder = useMemo(
    () => selectPreferredOrder(allOrders, visibleOrders, selection.orderId, selection),
    [allOrders, selection, visibleOrders]
  );
  const selectVisibleOrder = useCallback((orderId: string) => {
    setSelection({ orderId, includeHiddenSelected: false });
  }, []);
  const selectAnyOrder = useCallback((orderId: string) => {
    setSelection({ orderId, includeHiddenSelected: true });
  }, []);

  return {
    selectAnyOrder,
    selectedOrderId: selectedOrder?.id,
    selectedOrder,
    selectVisibleOrder
  };
}
