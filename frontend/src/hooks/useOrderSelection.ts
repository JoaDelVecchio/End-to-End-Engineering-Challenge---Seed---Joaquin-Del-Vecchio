import { useEffect, useMemo, useState } from "react";
import type { Order } from "../domain/types";
import { selectPreferredOrder, selectVisibleOrderId } from "../utils/selection";

export function useOrderSelection(allOrders: Order[], visibleOrders: Order[]) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>();

  const selectedOrder = useMemo(
    () => selectPreferredOrder(allOrders, visibleOrders, selectedOrderId),
    [allOrders, selectedOrderId, visibleOrders]
  );

  useEffect(() => {
    setSelectedOrderId((current) => selectVisibleOrderId(visibleOrders, current));
  }, [visibleOrders]);

  return {
    selectedOrder,
    selectedOrderId,
    setSelectedOrderId
  };
}
