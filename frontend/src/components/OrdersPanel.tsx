import type { Order, OrderFilters } from "../domain/types";
import { OrderFiltersBar } from "./OrderFiltersBar";
import { OrderList } from "./OrderList";

export function OrdersPanel({
  filters,
  isLoading,
  orders,
  selectedOrderId,
  onFilterChange,
  onSelectOrder
}: {
  filters: OrderFilters;
  isLoading: boolean;
  orders: Order[];
  selectedOrderId?: string;
  onFilterChange: (filters: OrderFilters) => void;
  onSelectOrder: (orderId: string) => void;
}) {
  const matchingOrdersLabel = orders.length === 1 ? "1 orden encontrada" : `${orders.length} órdenes encontradas`;

  return (
    <section className="orders-panel" aria-label="Órdenes">
      <div className="panel-header">
        <div>
          <h2>Órdenes</h2>
          <span>{matchingOrdersLabel}</span>
        </div>
      </div>
      <OrderFiltersBar filters={filters} onChange={onFilterChange} />
      <OrderList orders={orders} selectedOrderId={selectedOrderId} isLoading={isLoading} onSelect={onSelectOrder} />
    </section>
  );
}
