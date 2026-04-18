import { ICommandHandler } from '@nestjs/cqrs';
import { SnoozeFollowUpCommand } from './snooze-follow-up.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class SnoozeFollowUpHandler implements ICommandHandler<SnoozeFollowUpCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: SnoozeFollowUpCommand): Promise<{
        assignedTo: never;
    } & {
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
        dueDate: Date;
        title: string;
        assignedToId: string;
        priority: import("@prisma/working-client").$Enums.FollowUpPriority;
        completedAt: Date | null;
        entityId: string;
        snoozedUntil: Date | null;
        isOverdue: boolean;
    }>;
}
