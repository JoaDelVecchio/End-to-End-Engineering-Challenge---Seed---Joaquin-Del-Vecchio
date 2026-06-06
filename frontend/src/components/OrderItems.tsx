import { Package } from "lucide-react";
import { categoryLabel } from "../constants/categories";
import type { Order } from "../domain/types";
import { formatCurrency } from "../utils/format";

export function OrderItems({ order }: { order: Order }) {
  return (
    <section className="items-panel" aria-label="Productos de la orden">
      <div className="subsection-title">
        <Package size={18} aria-hidden="true" />
        <h3>Productos</h3>
      </div>
      <div className="items-table">
        {order.items.map((item) => (
          <div className="item-row" key={`${order.id}-${item.productId}`}>
            <span>
              <strong>{item.title}</strong>
              <small>{categoryLabel(item.category)}</small>
            </span>
            <span>
              {item.quantity} x {formatCurrency(item.unitPrice)}
            </span>
            <span>{formatCurrency(item.quantity * item.unitPrice)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
