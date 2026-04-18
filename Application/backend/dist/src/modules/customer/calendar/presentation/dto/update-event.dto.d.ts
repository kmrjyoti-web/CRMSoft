export declare class UpdateScheduledEventDto {
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    allDay?: boolean;
    timezone?: string;
    location?: string;
    meetingLink?: string;
    color?: string;
    recurrencePattern?: string;
    recurrenceConfig?: Record<string, unknown>;
    reminderMinutes?: number[];
    entityType?: string;
    entityId?: string;
}
