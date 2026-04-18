import { IQueryHandler } from '@nestjs/cqrs';
import { GetTaskHistoryQuery } from './get-task-history.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class GetTaskHistoryHandler implements IQueryHandler<GetTaskHistoryQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetTaskHistoryQuery): Promise<{
        data: {
            id: string;
            tenantId: string;
            createdAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            field: string | null;
            action: string;
            newValue: string | null;
            taskId: string;
            oldValue: string | null;
            changedById: string;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
}
