import type { Order, OrderFilters } from "../domain/types";

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

export function filterOrders(orders: Order[], filters: OrderFilters): Order[] {
  const tokens = filters.search
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const fromTime = dateBoundaryTime(filters.from, "from");
  const toTime = dateBoundaryTime(filters.to, "to");

  return orders.filter((order) => {
    const statusMatches = filters.status === "all" || order.status === filters.status;
    const orderTime = new Date(order.date).getTime();
    const fromMatches = fromTime === undefined || orderTime >= fromTime;
    const toMatches = toTime === undefined || orderTime <= toTime;
    const haystack = [
      order.id,
      order.status,
      order.buyer.name,
      order.buyer.email,
      ...order.items.flatMap((item) => [item.title, item.category])
    ]
      .join(" ")
      .toLowerCase();
    const textMatches = tokens.every((token) => haystack.includes(token));

    return statusMatches && fromMatches && toMatches && textMatches;
  });
}

function dateBoundaryTime(value: string | undefined, boundary: "from" | "to"): number | undefined {
  if (!value) {
    return undefined;
  }

  const normalizedValue = dateOnlyPattern.test(value)
    ? `${value}T${boundary === "from" ? "00:00:00.000" : "23:59:59.999"}Z`
    : value;
  const time = new Date(normalizedValue).getTime();

  return Number.isNaN(time) ? undefined : time;
}
