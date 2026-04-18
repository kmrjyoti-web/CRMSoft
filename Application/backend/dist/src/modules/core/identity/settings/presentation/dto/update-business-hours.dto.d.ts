import { DayOfWeek } from '@prisma/working-client';
export declare class UpdateBusinessHoursDto {
    dayOfWeek: DayOfWeek;
    isWorkingDay: boolean;
    startTime?: string;
    endTime?: string;
    breakStartTime?: string;
    breakEndTime?: string;
    shift2StartTime?: string;
    shift2EndTime?: string;
    notes?: string;
}
export declare class UpdateWeekScheduleDto {
    schedules: UpdateBusinessHoursDto[];
}
