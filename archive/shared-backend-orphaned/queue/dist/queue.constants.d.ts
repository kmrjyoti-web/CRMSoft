/** Standard CRMSoft queue names */
export declare const QUEUE_NAMES: {
    readonly NOTIFICATIONS: "notifications";
    readonly EMAIL: "email";
    readonly SMS: "sms";
    readonly PUSH: "push";
    readonly AUDIT: "audit";
    readonly REPORTS: "reports";
    readonly BACKUPS: "backups";
    readonly TESTS: "tests";
    readonly REMINDERS: "reminders";
    readonly ANALYTICS: "analytics";
};
export type QueueName = typeof QUEUE_NAMES[keyof typeof QUEUE_NAMES];
/** Standard BullMQ job result */
export interface JobResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    processedAt: Date;
    durationMs: number;
}
//# sourceMappingURL=queue.constants.d.ts.map