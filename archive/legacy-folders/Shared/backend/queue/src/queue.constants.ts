/** Standard CRMSoft queue names */
export const QUEUE_NAMES = {
  NOTIFICATIONS: 'notifications',
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  AUDIT: 'audit',
  REPORTS: 'reports',
  BACKUPS: 'backups',
  TESTS: 'tests',
  REMINDERS: 'reminders',
  ANALYTICS: 'analytics',
} as const;

export type QueueName = typeof QUEUE_NAMES[keyof typeof QUEUE_NAMES];

/** Standard BullMQ job result */
export interface JobResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  processedAt: Date;
  durationMs: number;
}
