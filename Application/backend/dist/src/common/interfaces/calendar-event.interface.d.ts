export interface CalendarEventInput {
    eventType: string;
    sourceId: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime?: Date;
    allDay?: boolean;
    color?: string;
    userId: string;
    tenantId?: string;
    location?: string;
    meetingLink?: string;
    entityType?: string;
    entityId?: string;
}
export interface UnifiedCalendarEvent {
    id: string;
    source: string;
    sourceId: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime?: Date;
    allDay: boolean;
    color?: string;
    userId: string;
    userName?: string;
    location?: string;
    meetingLink?: string;
    entityType?: string;
    entityId?: string;
    status?: string;
    priority?: string;
    editable: boolean;
}
