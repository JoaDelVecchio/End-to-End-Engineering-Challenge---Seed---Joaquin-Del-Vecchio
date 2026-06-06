import { Package } from "lucide-react";
import { NEXT_PRIMARY_STATUS, STATUS_LABELS } from "../constants/status";
import type { Order, OrderStatus } from "../domain/types";
import { formatCurrency, formatDate } from "../utils/format";
import { orderTotal } from "../utils/orders";
import { StatusBadge } from "./Badges";
import { ConfirmableAction } from "./ConfirmableAction";

export function OrderDetailHeader({
  order,
  pendingAction,
  onTransition
}: {
  order: Order;
  pendingAction?: string | null;
  onTransition: (order: Order, status: OrderStatus) => Promise<void>;
}) {
  const primaryTransition = NEXT_PRIMARY_STATUS[order.status];
  const isTransitionPending = primaryTransition
    ? pendingAction === `transition:${order.id}:${primaryTransition}`
    : false;
  const primaryTransitionLabel = primaryTransition
    ? STATUS_LABELS[primaryTransition].toLocaleLowerCase("es-AR")
    : "";
  const primaryTransitionTitle = primaryTransition ? STATUS_LABELS[primaryTransition] : "";
  const transitionDescription =
    primaryTransition === "delivered"
      ? "Las preguntas abiertas seguirán en prioridad hasta resolverse."
      : "Este cambio avanza la orden y no se puede deshacer desde el panel.";
  const isAnyActionPending = Boolean(pendingAction);

  return (
    <div className="detail-header">
      <div>
        <span className="section-kicker">Orden seleccionada</span>
        <h2>{order.id}</h2>
        <p>
          {order.buyer.name} - {formatDate(order.date)} - {formatCurrency(orderTotal(order))}
        </p>
      </div>
      <div className="detail-actions">
        <StatusBadge status={order.status} />
        {primaryTransition ? (
          <ConfirmableAction
            key={`${order.id}:${primaryTransition}`}
            variant="primary"
            disabled={isAnyActionPending}
            icon={<Package size={16} aria-hidden="true" />}
            isPending={isTransitionPending}
            triggerLabel={`Marcar como ${primaryTransitionLabel}`}
            pendingLabel={`Marcando como ${primaryTransitionLabel}`}
            confirmTitle={
              primaryTransition === "delivered"
                ? "Confirmar entrega"
                : `Confirmar cambio a ${primaryTransitionTitle}`
            }
            confirmDescription={transitionDescription}
            onConfirm={() => onTransition(order, primaryTransition)}
          />
        ) : null}
      </div>
    </div>
  );
}
