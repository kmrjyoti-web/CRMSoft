import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { BusinessHoursSchedule, DayOfWeek } from '@prisma/working-client';
import { UpdateBusinessHoursDto } from '../presentation/dto/update-business-hours.dto';
export declare class BusinessHoursService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    isWorkingNow(tenantId: string): Promise<boolean>;
    getNextWorkingTime(tenantId: string, from?: Date): Promise<Date>;
    calculateWorkingHours(tenantId: string, from: Date, to: Date): Promise<number>;
    getWeekSchedule(tenantId: string): Promise<BusinessHoursSchedule[]>;
    updateDay(tenantId: string, day: DayOfWeek, dto: UpdateBusinessHoursDto): Promise<void>;
    updateWeek(tenantId: string, schedules: UpdateBusinessHoursDto[]): Promise<void>;
    private isHoliday;
    private timeToMinutes;
}
