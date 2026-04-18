import { HolidayType } from '@prisma/working-client';
export declare class CreateHolidayDto {
    name: string;
    date: string;
    type?: HolidayType;
    isRecurring?: boolean;
    applicableStates?: string[];
    isHalfDay?: boolean;
    halfDayEnd?: string;
    description?: string;
}
export declare class UpdateHolidayDto {
    name?: string;
    date?: string;
    type?: HolidayType;
    isRecurring?: boolean;
    applicableStates?: string[];
    isHalfDay?: boolean;
    halfDayEnd?: string;
    description?: string;
    isActive?: boolean;
}
export declare class HolidayQueryDto {
    year?: number;
    type?: HolidayType;
}
