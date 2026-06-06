import { CalendarDays, ChevronDown, Filter, Search } from "lucide-react";
import { STATUS_LABELS } from "../constants/status";
import type { OrderFilters } from "../domain/types";

export function OrderFiltersBar({
  filters,
  onChange
}: {
  filters: OrderFilters;
  onChange: (filters: OrderFilters) => void;
}) {
  const statusLabel = filters.status === "all" ? "Todos los estados" : STATUS_LABELS[filters.status];

  return (
    <div className="filters" role="search" aria-label="Filtros de órdenes">
      <label className="search-control" htmlFor="order-search">
        <Search size={18} aria-hidden="true" />
        <span className="filter-field-body">
          <span className="filter-label">Buscar</span>
          <input
            id="order-search"
            value={filters.search}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            placeholder="Comprador, orden o producto"
          />
        </span>
      </label>
      <label className="select-control" htmlFor="order-status-filter">
        <Filter size={17} aria-hidden="true" />
        <span className="filter-field-body">
          <span className="filter-label">Estado</span>
          <span className="select-value">{statusLabel}</span>
        </span>
        <ChevronDown className="select-caret" size={16} aria-hidden="true" />
        <select
          id="order-status-filter"
          className="select-input"
          value={filters.status}
          onChange={(event) => onChange({ ...filters, status: event.target.value as OrderFilters["status"] })}
          aria-label="Filtrar órdenes por estado"
        >
          <option value="all">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <option key={status} value={status}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="date-field" htmlFor="order-from-date">
        <CalendarDays size={16} aria-hidden="true" />
        <span className="filter-field-body">
          <span className="filter-label">Fecha inicio</span>
          <input
            id="order-from-date"
            className="date-control"
            type="date"
            value={filters.from ?? ""}
            onChange={(event) => onChange({ ...filters, from: event.target.value || undefined })}
          />
        </span>
      </label>
      <label className="date-field" htmlFor="order-to-date">
        <CalendarDays size={16} aria-hidden="true" />
        <span className="filter-field-body">
          <span className="filter-label">Fecha fin</span>
          <input
            id="order-to-date"
            className="date-control"
            type="date"
            value={filters.to ?? ""}
            onChange={(event) => onChange({ ...filters, to: event.target.value || undefined })}
          />
        </span>
      </label>
    </div>
  );
}
