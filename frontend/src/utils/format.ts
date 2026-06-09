import { APP_CURRENCY, APP_LOCALE, APP_TIME_ZONE } from "../constants/format";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(APP_LOCALE, {
    style: "currency",
    currency: APP_CURRENCY,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone: APP_TIME_ZONE,
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
