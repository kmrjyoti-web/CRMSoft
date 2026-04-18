export declare class EventParticipantDto {
    userId?: string;
    email?: string;
    name?: string;
    role?: string;
}
export declare class CreateScheduledEventDto {
    title: string;
    description?: string;
    type: string;
    startTime: string;
    endTime: string;
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
    participants?: EventParticipantDto[];
}
