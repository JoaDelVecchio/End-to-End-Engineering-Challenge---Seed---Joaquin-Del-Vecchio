import { createApp } from "./api/app";
import { readServerConfig } from "./config/env";
import { JsonFileStore } from "./data/store";
import { CompositeNotifier, ConsoleEmailNotifier } from "./services/notifications";

const config = readServerConfig();

const app = createApp({
  store: JsonFileStore.load(),
  notifier: new CompositeNotifier([new ConsoleEmailNotifier()]),
  allowedOrigins: config.allowedOrigins
});

app.listen(config.port, "0.0.0.0", () => {
  console.log(`Seller Dashboard API listening on http://0.0.0.0:${config.port}`);
});
