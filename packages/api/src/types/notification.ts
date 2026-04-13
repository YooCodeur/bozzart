import type { NotificationType } from "./enums";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  data: Record<string, unknown>;
  isRead: boolean;
  deepLink?: string;
  createdAt: string;
}
