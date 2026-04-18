import { IQueryHandler } from '@nestjs/cqrs';
import { GetFieldHistoryQuery } from './get-field-history.query';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class GetFieldHistoryHandler implements IQueryHandler<GetFieldHistoryQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetFieldHistoryQuery): Promise<{
        entityType: string;
        entityId: string;
        fieldName: string;
        history: {
            id: string;
            auditLogId: string;
            oldValue: string | null;
            newValue: string | null;
            oldDisplayValue: string | null;
            newDisplayValue: string | null;
            fieldType: string | null;
            performedByName: string | null;
            performedById: string | null;
            action: import("@prisma/identity-client").$Enums.AuditAction;
            createdAt: string;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
}
