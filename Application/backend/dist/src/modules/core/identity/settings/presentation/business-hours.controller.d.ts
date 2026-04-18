import { DayOfWeek } from '@prisma/working-client';
import { BusinessHoursService } from '../services/business-hours.service';
import { UpdateBusinessHoursDto, UpdateWeekScheduleDto } from './dto/update-business-hours.dto';
export declare class BusinessHoursController {
    private readonly service;
    constructor(service: BusinessHoursService);
    getWeek(req: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        notes: string | null;
        endTime: string | null;
        startTime: string | null;
        dayOfWeek: import("@prisma/working-client").$Enums.DayOfWeek;
        isWorkingDay: boolean;
        breakStartTime: string | null;
        breakEndTime: string | null;
        shift2StartTime: string | null;
        shift2EndTime: string | null;
    }[]>;
    updateWeek(req: any, dto: UpdateWeekScheduleDto): Promise<void>;
    updateDay(req: any, day: DayOfWeek, dto: UpdateBusinessHoursDto): Promise<void>;
    isWorkingNow(req: any): Promise<{
        working: boolean;
    }>;
}
