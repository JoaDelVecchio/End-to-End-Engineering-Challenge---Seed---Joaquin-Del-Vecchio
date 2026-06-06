import { useCallback, useEffect, useRef, useState } from "react";
import { fetchOrders, fetchPriorityQuestions, fetchSeller } from "../api/sellerDashboardApi";
import { SELLER_ID } from "../constants/seller";
import type { Order, PriorityQuestion, Seller } from "../domain/types";

export function useDashboardData() {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [priorityQuestions, setPriorityQuestions] = useState<PriorityQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const refreshDashboard = useCallback(async (signal?: AbortSignal) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setError(null);
    setIsLoading(true);

    try {
      const [nextSeller, nextOrders, nextPriorityQuestions] = await Promise.all([
        fetchSeller(SELLER_ID, signal),
        fetchOrders(SELLER_ID, signal),
        fetchPriorityQuestions(SELLER_ID, signal)
      ]);

      if (signal?.aborted || requestId !== requestIdRef.current) {
        return;
      }

      setSeller(nextSeller);
      setOrders(nextOrders);
      setPriorityQuestions(nextPriorityQuestions);
    } catch (loadError) {
      if (signal?.aborted || requestId !== requestIdRef.current) {
        return;
      }

      setError(loadError instanceof Error ? loadError.message : "No pudimos cargar el panel.");
    } finally {
      if (!signal?.aborted && requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refreshDashboard(controller.signal);

    return () => controller.abort();
  }, [refreshDashboard]);

  return {
    error,
    isLoading,
    orders,
    priorityQuestions,
    refreshDashboard,
    seller
  };
}
