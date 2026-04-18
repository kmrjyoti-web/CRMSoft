export declare class FreeSlotsQueryDto {
    date: string;
    durationMinutes: number;
    userIds: string[];
    timezone?: string;
}
export declare class ConflictCheckDto {
    startTime: string;
    endTime: string;
    excludeEventId?: string;
}
