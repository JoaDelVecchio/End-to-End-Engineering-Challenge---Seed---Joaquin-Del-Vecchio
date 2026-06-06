import { RefreshCw } from "lucide-react";
import { OrderDetail } from "./components/OrderDetail";
import { OrdersPanel } from "./components/OrdersPanel";
import { PriorityQueue } from "./components/PriorityQueue";
import { Sidebar } from "./components/Sidebar";
import { SummaryMetrics } from "./components/SummaryMetrics";
import { useSellerDashboard } from "./hooks/useSellerDashboard";

export function App() {
  const dashboard = useSellerDashboard();

  return (
    <div className="app-shell">
      <Sidebar seller={dashboard.seller} />

      <main className="workspace" aria-busy={dashboard.isLoading}>
        <header className="topbar">
          <div>
            <h1>Panel de ventas</h1>
            <p>
              Órdenes recientes y preguntas pendientes de compradores
              {dashboard.seller ? ` para ${dashboard.seller.name}` : ""}
            </p>
          </div>
          <button
            className="icon-text-button"
            disabled={dashboard.isLoading}
            onClick={() => void dashboard.loadDashboard()}
            type="button"
            aria-label={dashboard.isLoading ? "Cargando panel" : "Actualizar panel"}
          >
            <RefreshCw size={17} aria-hidden="true" />
            {dashboard.isLoading ? "Cargando" : "Actualizar"}
          </button>
        </header>

        {dashboard.error ? (
          <div className="error-banner" role="alert">
            {dashboard.error}
          </div>
        ) : null}

        {dashboard.actionError ? (
          <div className="error-banner" role="alert">
            {dashboard.actionError}
          </div>
        ) : null}

        <SummaryMetrics summary={dashboard.summary} />

        <section className="dashboard-grid">
          <OrdersPanel
            filters={dashboard.filters}
            isLoading={dashboard.isLoading}
            orders={dashboard.visibleOrders}
            selectedOrderId={dashboard.selectedOrder?.id}
            onFilterChange={dashboard.setFilters}
            onSelectOrder={dashboard.setSelectedOrderId}
          />

          <PriorityQueue questions={dashboard.priorityQuestions} onSelectOrder={dashboard.setSelectedOrderId} />
        </section>

        <OrderDetail
          order={dashboard.selectedOrder}
          pendingAction={dashboard.pendingAction}
          replyDrafts={dashboard.replyDrafts}
          onReplyDraftChange={dashboard.updateReplyDraft}
          onReopen={dashboard.handleReopen}
          onReply={dashboard.handleReply}
          onResolve={dashboard.handleResolve}
          onTransition={dashboard.handleTransition}
        />
      </main>
    </div>
  );
}
