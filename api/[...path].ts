import { createApp } from "../backend/src/api/app";
import { createSeedData } from "../backend/src/data/seedData";
import { InMemoryStore } from "../backend/src/data/store";
import { ConsoleEmailNotifier } from "../backend/src/services/notifications";

const app = createApp({
  store: new InMemoryStore(createSeedData()),
  notifier: new ConsoleEmailNotifier()
});

export default app;
