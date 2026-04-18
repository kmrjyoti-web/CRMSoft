import { IQueryHandler } from '@nestjs/cqrs';
import { ListSavedFiltersQuery } from './list-saved-filters.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class ListSavedFiltersHandler implements IQueryHandler<ListSavedFiltersQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: ListSavedFiltersQuery): Promise<{
        data: {
            id: string;
            tenantId: string;
            name: string;
            entityType: string;
            description: string | null;
            isDefault: boolean;
            createdById: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            usageCount: number;
            lastUsedAt: Date | null;
            isShared: boolean;
            filterConfig: import("@prisma/working-client/runtime/library").JsonValue;
            sharedWithRoles: import("@prisma/working-client/runtime/library").JsonValue | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
}
