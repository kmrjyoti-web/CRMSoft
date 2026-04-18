export declare class WorkingHourEntryDto {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isWorkingDay?: boolean;
}
export declare class SetWorkingHoursDto {
    hours: WorkingHourEntryDto[];
    timezone?: string;
}
