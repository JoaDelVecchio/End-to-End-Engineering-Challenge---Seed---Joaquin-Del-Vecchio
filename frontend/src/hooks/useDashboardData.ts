import { useCallback, useEffect, useRef, useState } from "react";
import { fetchOrders, fetchPriorityQuestions, fetchSeller } from "../api/sellerDashboardApi";
import { SELLER_ID } from "../constants/seller";
import type { Order, PriorityQuestion, Seller } from "../domain/types";
import { mergeUpdatedOrder, mergeUpdatedOrderIntoPriorityQuestions } from "../utils/dashboardState";

async function fetchDashboardData(signal?: AbortSignal) {
  const [seller, orders, priorityQuestions] = await Promise.all([
    fetchSeller(SELLER_ID, signal),
    fetchOrders(SELLER_ID, signal),
    fetchPriorityQuestions(SELLER_ID, signal)
  ]);

  return { seller, orders, priorityQuestions };
}

export function useDashboardData() {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [priorityQuestions, setPriorityQuestions] = useState<PriorityQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const refreshOperationalData = useCallback(async () => {
    setError(null);

    try {
      const [nextOrders, nextPriorityQuestions] = await Promise.all([
        fetchOrders(SELLER_ID),
        fetchPriorityQuestions(SELLER_ID)
      ]);

      setOrders(nextOrders);
      setPriorityQuestions(nextPriorityQuestions);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No pudimos cargar los datos operativos.");
    }
  }, []);

  const refreshDashboard = useCallback(async (signal?: AbortSignal) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setError(null);
    setIsLoading(true);

    try {
      const nextData = await fetchDashboardData(signal);

      if (signal?.aborted || requestId !== requestIdRef.current) {
        return;
      }

      setSeller(nextData.seller);
      setOrders(nextData.orders);
      setPriorityQuestions(nextData.priorityQuestions);
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

  const applyUpdatedOrder = useCallback((updatedOrder: Order) => {
    setOrders((currentOrders) => mergeUpdatedOrder(currentOrders, updatedOrder));
    setPriorityQuestions((currentQuestions) =>
      mergeUpdatedOrderIntoPriorityQuestions(currentQuestions, updatedOrder)
    );
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    async function loadInitialDashboard() {
      try {
        const nextData = await fetchDashboardData(controller.signal);

        if (controller.signal.aborted || requestId !== requestIdRef.current) {
          return;
        }

        setSeller(nextData.seller);
        setOrders(nextData.orders);
        setPriorityQuestions(nextData.priorityQuestions);
      } catch (loadError) {
        if (controller.signal.aborted || requestId !== requestIdRef.current) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "No pudimos cargar el panel.");
      } finally {
        if (!controller.signal.aborted && requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialDashboard();

    return () => controller.abort();
  }, []);

  return {
    error,
    isLoading,
    orders,
    priorityQuestions,
    applyUpdatedOrder,
    refreshOperationalData,
    refreshDashboard,
    seller
  };
}
