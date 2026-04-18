export declare class UpdateRecurrenceCommand {
    readonly id: string;
    readonly userId: string;
    readonly data: {
        pattern?: string;
        interval?: number;
        daysOfWeek?: number[];
        dayOfMonth?: number;
        endDate?: Date;
        maxOccurrences?: number;
        templateData?: Record<string, any>;
    };
    constructor(id: string, userId: string, data: {
        pattern?: string;
        interval?: number;
        daysOfWeek?: number[];
        dayOfMonth?: number;
        endDate?: Date;
        maxOccurrences?: number;
        templateData?: Record<string, any>;
    });
}
