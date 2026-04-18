import { IQueryHandler } from '@nestjs/cqrs';
import { GetPendingRemindersQuery } from './get-pending-reminders.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class GetPendingRemindersHandler implements IQueryHandler<GetPendingRemindersQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetPendingRemindersQuery): Promise<{
        data: {
            id: string;
            tenantId: string;
            entityType: string;
            description: string | null;
            isActive: boolean;
            createdById: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            type: import("@prisma/working-client").$Enums.ReminderType;
            status: import("@prisma/working-client").$Enums.ReminderStatus;
            channel: import("@prisma/working-client").$Enums.ReminderChannel;
            title: string;
            message: string | null;
            sentAt: Date | null;
            scheduledAt: Date;
            taskId: string | null;
            entityId: string;
            recipientId: string;
            recurrenceConfig: import("@prisma/working-client/runtime/library").JsonValue | null;
            isSent: boolean;
            snoozedUntil: Date | null;
            snoozeCount: number;
            maxSnooze: number;
            triggeredAt: Date | null;
            acknowledgedAt: Date | null;
            missedAt: Date | null;
            notifyVia: import("@prisma/working-client/runtime/library").JsonValue;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
}
