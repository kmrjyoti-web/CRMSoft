export declare class SnoozeReminderCommand {
    readonly id: string;
    readonly userId: string;
    readonly snoozedUntil?: Date | undefined;
    constructor(id: string, userId: string, snoozedUntil?: Date | undefined);
}
