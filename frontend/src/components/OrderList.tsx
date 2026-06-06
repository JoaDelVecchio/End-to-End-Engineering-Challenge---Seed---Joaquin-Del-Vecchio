import type { Order } from "../domain/types";
import { formatCurrency, formatDate } from "../utils/format";
import { orderTotal, orderUnitCount } from "../utils/orders";
import { StatusBadge } from "./Badges";

export function OrderList({
  orders,
  selectedOrderId,
  isLoading,
  onSelect
}: {
  orders: Order[];
  selectedOrderId?: string;
  isLoading: boolean;
  onSelect: (orderId: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="empty-state" role="status" aria-live="polite">
        Cargando órdenes
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="empty-state" role="status">
        No hay órdenes para esos filtros
      </div>
    );
  }

  return (
    <div className="order-list" aria-label="Órdenes recientes">
      <div className="order-list-header" aria-hidden="true">
        <span>Orden</span>
        <span>Comprador</span>
        <span>Estado</span>
        <span>Unidades</span>
        <span>Total</span>
      </div>
      {orders.map((order) => {
        const unitCount = orderUnitCount(order);

        return (
          <button
            key={order.id}
            className={`order-row ${order.id === selectedOrderId ? "selected" : ""}`}
            onClick={() => onSelect(order.id)}
            type="button"
            aria-current={order.id === selectedOrderId ? "true" : undefined}
            aria-label={`Seleccionar orden ${order.id} de ${order.buyer.name}`}
          >
            <span>
              <strong>{order.id}</strong>
              <small>{formatDate(order.date)}</small>
            </span>
            <span>
              <strong>{order.buyer.name}</strong>
              <small>{order.buyer.email}</small>
            </span>
            <span>
              <StatusBadge status={order.status} />
            </span>
            <span>
              {unitCount}
            </span>
            <span>{formatCurrency(orderTotal(order))}</span>
          </button>
        );
      })}
    </div>
  );
}
