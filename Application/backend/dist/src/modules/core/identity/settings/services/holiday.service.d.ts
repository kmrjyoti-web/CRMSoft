import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { HolidayCalendar, HolidayType } from '@prisma/working-client';
export declare class HolidayService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(tenantId: string, data: {
        name: string;
        date: string;
        type?: HolidayType;
        isRecurring?: boolean;
        applicableStates?: string[];
        isHalfDay?: boolean;
        halfDayEnd?: string;
        description?: string;
    }): Promise<HolidayCalendar>;
    list(tenantId: string, year?: number, type?: HolidayType): Promise<HolidayCalendar[]>;
    upcoming(tenantId: string, limit?: number): Promise<HolidayCalendar[]>;
    update(tenantId: string, id: string, data: Partial<HolidayCalendar> & {
        date?: string;
    }): Promise<HolidayCalendar>;
    remove(tenantId: string, id: string): Promise<void>;
    isHoliday(tenantId: string, date: Date, state?: string): Promise<boolean>;
}
