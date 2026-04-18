export declare class CreateRecurrenceDto {
    entityType: string;
    entityId?: string;
    pattern: string;
    startDate: string;
    templateData: Record<string, any>;
    interval?: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    endDate?: string;
    maxOccurrences?: number;
}
