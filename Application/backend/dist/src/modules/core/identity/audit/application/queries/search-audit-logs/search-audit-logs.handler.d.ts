import { IQueryHandler } from '@nestjs/cqrs';
import { SearchAuditLogsQuery } from './search-audit-logs.query';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class SearchAuditLogsHandler implements IQueryHandler<SearchAuditLogsQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: SearchAuditLogsQuery): Promise<{
        results: {
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
            isSensitive: boolean;
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
