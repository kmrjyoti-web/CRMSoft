export declare class UpdateRecurrenceDto {
    pattern?: string;
    interval?: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    endDate?: string;
    maxOccurrences?: number;
    templateData?: Record<string, any>;
}
