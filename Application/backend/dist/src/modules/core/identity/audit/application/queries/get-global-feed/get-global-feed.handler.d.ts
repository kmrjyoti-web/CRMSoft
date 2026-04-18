import { IQueryHandler } from '@nestjs/cqrs';
import { GetGlobalFeedQuery } from './get-global-feed.query';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class GetGlobalFeedHandler implements IQueryHandler<GetGlobalFeedQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetGlobalFeedQuery): Promise<{
        feed: {
            id: string;
            entityType: import("@prisma/identity-client").$Enums.AuditEntityType;
            entityId: string;
            entityLabel: string | null;
            action: import("@prisma/identity-client").$Enums.AuditAction;
            summary: string;
            changeCount: number;
            performedByName: string | null;
            performedById: string | null;
            source: string | null;
            module: string | null;
            createdAt: string;
            fieldChanges: {
                fieldName: string;
                fieldLabel: string | null;
                oldDisplayValue: string | null;
                newDisplayValue: string | null;
            }[];
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
}
