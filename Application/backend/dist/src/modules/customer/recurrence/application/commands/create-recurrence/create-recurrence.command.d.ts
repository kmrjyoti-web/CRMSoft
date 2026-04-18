export declare class CreateRecurrenceCommand {
    readonly entityType: string;
    readonly pattern: string;
    readonly startDate: Date;
    readonly createdById: string;
    readonly templateData: Record<string, any>;
    readonly entityId?: string | undefined;
    readonly interval?: number | undefined;
    readonly daysOfWeek?: number[] | undefined;
    readonly dayOfMonth?: number | undefined;
    readonly endDate?: Date | undefined;
    readonly maxOccurrences?: number | undefined;
    constructor(entityType: string, pattern: string, startDate: Date, createdById: string, templateData: Record<string, any>, entityId?: string | undefined, interval?: number | undefined, daysOfWeek?: number[] | undefined, dayOfMonth?: number | undefined, endDate?: Date | undefined, maxOccurrences?: number | undefined);
}
