export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'WHATSAPP' | 'CALL' | 'IN_APP';
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface NotificationPayload {
  tenantId?: string;
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientFcmToken?: string;
  channel: NotificationChannel;
  templateCode?: string;
  subject?: string;
  body: string;
  data?: Record<string, unknown>;
  priority?: NotificationPriority;
  scheduledAt?: Date;
  idempotencyKey?: string;
}

export interface NotificationResult {
  success: boolean;
  channel: NotificationChannel;
  messageId?: string;
  error?: string;
  sentAt: Date;
}

export interface INotificationService {
  send(payload: NotificationPayload): Promise<NotificationResult>;
  sendBulk(payloads: NotificationPayload[]): Promise<NotificationResult[]>;
}

export interface IChannelAdapter {
  channel: NotificationChannel;
  send(payload: NotificationPayload): Promise<NotificationResult>;
  isAvailable(): boolean;
}
