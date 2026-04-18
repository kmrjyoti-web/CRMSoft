export declare class CreateBlockedSlotDto {
    title: string;
    reason?: string;
    startTime: string;
    endTime: string;
    allDay?: boolean;
    status?: string;
    isRecurring?: boolean;
    recurrencePattern?: string;
}
export declare class ListBlockedSlotsQueryDto {
    startDate: string;
    endDate: string;
}
