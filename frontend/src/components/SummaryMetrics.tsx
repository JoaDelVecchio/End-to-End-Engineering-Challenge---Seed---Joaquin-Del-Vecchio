import { AlertTriangle, CircleDollarSign, MessageSquare, PackageCheck } from "lucide-react";
import type { ReactNode } from "react";
import { formatCurrency } from "../utils/format";
import type { DashboardSummary } from "../utils/orders";

export function SummaryMetrics({ summary }: { summary: DashboardSummary }) {
  return (
    <section className="metric-grid" aria-label="Resumen del vendedor">
      <Metric label="Preguntas abiertas" value={summary.openQuestions} icon={<MessageSquare />} tone="blue" />
      <Metric label="Preguntas urgentes" value={summary.criticalQuestions} icon={<AlertTriangle />} tone="red" />
      <Metric label="Órdenes en curso" value={summary.activeOrders} icon={<PackageCheck />} tone="amber" />
      <Metric label="Ventas recientes" value={formatCurrency(summary.totalValue)} icon={<CircleDollarSign />} tone="green" />
    </section>
  );
}

function Metric({
  label,
  value,
  icon,
  tone
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  tone: "amber" | "red" | "blue" | "green";
}) {
  return (
    <div className={`metric metric-${tone}`}>
      <div className="metric-icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
