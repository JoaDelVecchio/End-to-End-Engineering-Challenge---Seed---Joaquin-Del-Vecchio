import { Ban, Package } from "lucide-react";
import { NEXT_PRIMARY_STATUS, STATUS_LABELS } from "../../constants/status";
import type { Order, OrderStatus } from "../../domain/types";
import { formatCurrency, formatDate } from "../../utils/format";
import { orderTotal } from "../../utils/orders";
import { StatusBadge } from "../Badges";
import { ConfirmableAction } from "../ConfirmableAction";

export function OrderDetailHeader({
  order,
  pendingActions,
  onTransition
}: {
  order: Order;
  pendingActions: string[];
  onTransition: (order: Order, status: OrderStatus) => Promise<void>;
}) {
  const primaryTransition = NEXT_PRIMARY_STATUS[order.status];
  const canCancel = order.status === "paid" || order.status === "packing";
  const isTransitionPending = primaryTransition
    ? pendingActions.includes(`transition:${order.id}:${primaryTransition}`)
    : false;
  const isCancelPending = pendingActions.includes(`transition:${order.id}:cancelled`);
  const primaryTransitionLabel = primaryTransition
    ? STATUS_LABELS[primaryTransition].toLocaleLowerCase("es-AR")
    : "";
  const primaryTransitionTitle = primaryTransition ? STATUS_LABELS[primaryTransition] : "";
  const transitionDescription =
    primaryTransition === "delivered"
      ? "Las preguntas abiertas seguirán en prioridad hasta resolverse."
      : "Este cambio avanza la orden y no se puede deshacer desde el panel.";
  const isOrderActionPending = pendingActions.some((action) => action.startsWith(`transition:${order.id}:`));

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
            disabled={isOrderActionPending}
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
        {canCancel ? (
          <ConfirmableAction
            key={`${order.id}:cancelled`}
            variant="secondary"
            disabled={isOrderActionPending}
            icon={<Ban size={16} aria-hidden="true" />}
            isPending={isCancelPending}
            triggerLabel="Cancelar orden"
            pendingLabel="Cancelando orden"
            confirmTitle="Confirmar cancelación"
            confirmDescription="La orden pasará a estado cancelado y no podrá avanzar desde el panel."
            onConfirm={() => onTransition(order, "cancelled")}
          />
        ) : null}
      </div>
    </div>
  );
}
