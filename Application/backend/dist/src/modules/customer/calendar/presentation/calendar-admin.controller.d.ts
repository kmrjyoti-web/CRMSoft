import { ApiResponse } from '../../../../common/utils/api-response';
import { CalendarConfigService } from '../services/calendar-config.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class CalendarAdminController {
    private readonly configService;
    private readonly prisma;
    constructor(configService: CalendarConfigService, prisma: PrismaService);
    getAllConfigs(tenantId: string): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        configKey: string;
        configValue: import("@prisma/working-client/runtime/library").JsonValue;
    }[]>>;
    getConfig(tenantId: string, key: string): Promise<ApiResponse<any>>;
    upsertConfig(tenantId: string, userId: string, key: string, body: {
        value: any;
        description?: string;
    }): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        configKey: string;
        configValue: import("@prisma/working-client/runtime/library").JsonValue;
    }>>;
    resetToDefaults(tenantId: string, userId: string): Promise<ApiResponse<null>>;
    getHolidays(tenantId: string): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        type: import("@prisma/working-client").$Enums.HolidayType;
        date: Date;
        isRecurring: boolean;
        applicableStates: string[];
        isHalfDay: boolean;
        halfDayEnd: string | null;
    }[]>>;
    createHoliday(tenantId: string, body: {
        name: string;
        date: string;
        type?: string;
        isRecurring?: boolean;
        applicableStates?: string[];
        isHalfDay?: boolean;
        halfDayEnd?: string;
        description?: string;
    }): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        type: import("@prisma/working-client").$Enums.HolidayType;
        date: Date;
        isRecurring: boolean;
        applicableStates: string[];
        isHalfDay: boolean;
        halfDayEnd: string | null;
    }>>;
    deleteHoliday(id: string): Promise<ApiResponse<null>>;
}
