import { PriorityLevel } from "../domain/types";

export interface NotificationEvent {
  channel: "email" | "slack" | "sms";
  sellerId: string;
  orderId: string;
  questionId: string;
  priority: PriorityLevel;
  subject: string;
  body: string;
}

export interface Notifier {
  notify(event: NotificationEvent): Promise<void>;
}

export class ConsoleEmailNotifier implements Notifier {
  async notify(event: NotificationEvent): Promise<void> {
    console.log(
      `[email:${event.priority}] seller=${event.sellerId} order=${event.orderId} question=${event.questionId} ${event.subject}`
    );
  }
}

export class CompositeNotifier implements Notifier {
  constructor(private readonly notifiers: Notifier[]) {}

  async notify(event: NotificationEvent): Promise<void> {
    await Promise.all(this.notifiers.map((notifier) => notifier.notify(event)));
  }
}

export function shouldNotifyPriority(priority: PriorityLevel): boolean {
  return priority === "high" || priority === "critical";
}
