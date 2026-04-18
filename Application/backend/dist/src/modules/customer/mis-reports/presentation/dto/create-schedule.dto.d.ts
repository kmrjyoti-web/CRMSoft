export declare class CreateScheduleDto {
    name: string;
    reportCode: string;
    frequency: string;
    format: string;
    filters?: Record<string, any>;
    recipientEmails: string[];
    dayOfWeek?: number;
    dayOfMonth?: number;
    timeOfDay?: string;
}
