import { IQueryHandler } from '@nestjs/cqrs';
import { GetFollowUpListQuery } from './get-follow-up-list.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class GetFollowUpListHandler implements IQueryHandler<GetFollowUpListQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetFollowUpListQuery): Promise<{
        data: ({
            createdBy: never;
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
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
}
