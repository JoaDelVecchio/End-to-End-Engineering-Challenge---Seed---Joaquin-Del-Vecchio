import { CompositeNotifier, NotificationEvent, Notifier, shouldNotifyPriority } from "./notifications";

class RecordingNotifier implements Notifier {
  readonly events: NotificationEvent[] = [];

  async notify(event: NotificationEvent): Promise<void> {
    this.events.push(event);
  }
}

const event: NotificationEvent = {
  channel: "email",
  sellerId: "seller-1",
  orderId: "ord-1",
  questionId: "q-1",
  priority: "critical",
  subject: "Critical question",
  body: "Urgent refund"
};

describe("notifications", () => {
  it("fans out events to every configured notifier", async () => {
    const first = new RecordingNotifier();
    const second = new RecordingNotifier();

    await new CompositeNotifier([first, second]).notify(event);

    expect(first.events).toEqual([event]);
    expect(second.events).toEqual([event]);
  });

  it("notifies only for high and critical priorities", () => {
    expect(shouldNotifyPriority("low")).toBe(false);
    expect(shouldNotifyPriority("medium")).toBe(false);
    expect(shouldNotifyPriority("high")).toBe(true);
    expect(shouldNotifyPriority("critical")).toBe(true);
  });
});
