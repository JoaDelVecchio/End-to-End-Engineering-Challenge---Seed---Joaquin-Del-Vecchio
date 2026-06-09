import type { SellerDashboardStore } from "../data/storePort";
import type { Notifier } from "../services/notifications";

export interface AppDependencies {
  store: SellerDashboardStore;
  notifier: Notifier;
  allowedOrigins?: string[];
  now?: () => Date;
}
