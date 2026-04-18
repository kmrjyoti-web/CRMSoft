import { PrismaService } from '../../../../core/prisma/prisma.service';
interface WorkingHourEntry {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isWorkingDay?: boolean;
}
export declare class AvailabilityService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    setWorkingHours(userId: string, tenantId: string, hours: WorkingHourEntry[], timezone?: string): Promise<any>;
    getWorkingHours(userId: string, tenantId: string): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        timezone: string;
        userId: string;
        endTime: string;
        startTime: string;
        dayOfWeek: number;
        isWorkingDay: boolean;
    }[]>;
    createBlockedSlot(userId: string, tenantId: string, dto: any): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: import("@prisma/working-client").$Enums.AvailabilityStatus;
        userId: string;
        title: string;
        isRecurring: boolean;
        endTime: Date;
        reason: string | null;
        startTime: Date;
        recurrenceConfig: import("@prisma/working-client/runtime/library").JsonValue | null;
        allDay: boolean;
        recurrencePattern: import("@prisma/working-client").$Enums.RecurrencePattern | null;
    }>;
    deleteBlockedSlot(id: string, userId: string, tenantId: string): Promise<void>;
    listBlockedSlots(userId: string, tenantId: string, startDate: Date, endDate: Date): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: import("@prisma/working-client").$Enums.AvailabilityStatus;
        userId: string;
        title: string;
        isRecurring: boolean;
        endTime: Date;
        reason: string | null;
        startTime: Date;
        recurrenceConfig: import("@prisma/working-client/runtime/library").JsonValue | null;
        allDay: boolean;
        recurrencePattern: import("@prisma/working-client").$Enums.RecurrencePattern | null;
    }[]>;
    checkConflicts(userId: string, tenantId: string, startTime: Date, endTime: Date, excludeEventId?: string): Promise<{
        hasConflict: boolean;
        conflicts: ({
            type: "EVENT";
            id: string;
            status: import("@prisma/working-client").$Enums.EventStatus;
            title: string;
            endTime: Date;
            startTime: Date;
        } | {
            type: "BLOCKED_SLOT";
            id: string;
            status: import("@prisma/working-client").$Enums.AvailabilityStatus;
            title: string;
            endTime: Date;
            startTime: Date;
        })[];
    }>;
    findFreeSlots(userIds: string[], tenantId: string, date: Date, durationMinutes: number, timezone?: string): Promise<{
        startTime: Date;
        endTime: Date;
        availableForAll: boolean;
    }[]>;
    getAvailabilityStatus(userId: string, tenantId: string, dateTime: Date): Promise<string>;
    private timeStringToDate;
    private subtractRanges;
}
export {};
