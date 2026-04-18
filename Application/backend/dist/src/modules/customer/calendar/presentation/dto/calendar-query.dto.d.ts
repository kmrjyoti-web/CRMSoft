export declare class CalendarQueryDto {
    startDate: string;
    endDate: string;
    eventTypes?: string[];
    sources?: string[];
    userId?: string;
    view?: string;
}
export declare class TeamCalendarQueryDto {
    startDate: string;
    endDate: string;
    userIds: string[];
}
export declare class UnifiedCalendarQueryDto {
    startDate: string;
    endDate: string;
    sources?: string[];
    userId?: string;
    view?: string;
    search?: string;
}
