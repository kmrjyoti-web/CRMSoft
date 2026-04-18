import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetWorkflowListQuery } from './get-workflow-list.query';
export declare class GetWorkflowListHandler implements IQueryHandler<GetWorkflowListQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetWorkflowListQuery): Promise<{
        data: ({
            _count: {
                states: number;
                transitions: number;
                instances: number;
            };
        } & {
            id: string;
            tenantId: string;
            name: string;
            code: string;
            entityType: string;
            description: string | null;
            version: number;
            isDefault: boolean;
            isActive: boolean;
            configJson: import("@prisma/working-client/runtime/library").JsonValue | null;
            createdById: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
}
