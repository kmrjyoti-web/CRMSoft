import { IQueryHandler } from '@nestjs/cqrs';
import { GetAuditLogDetailQuery } from './get-audit-log-detail.query';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class GetAuditLogDetailHandler implements IQueryHandler<GetAuditLogDetailQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetAuditLogDetailQuery): Promise<{
        id: string;
        entityType: import("@prisma/identity-client").$Enums.AuditEntityType;
        entityId: string;
        entityLabel: string | null;
        action: import("@prisma/identity-client").$Enums.AuditAction;
        summary: string;
        changeCount: number;
        beforeSnapshot: import("@prisma/identity-client/runtime/library").JsonValue;
        afterSnapshot: import("@prisma/identity-client/runtime/library").JsonValue;
        performedById: string | null;
        performedByName: string | null;
        performedByEmail: string | null;
        performedByRole: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        httpMethod: string | null;
        requestUrl: string | null;
        source: string | null;
        module: string | null;
        correlationId: string | null;
        tags: string[];
        isSensitive: boolean;
        isSystemAction: boolean;
        createdAt: string;
        fieldChanges: {
            id: string;
            fieldName: string;
            fieldLabel: string | null;
            fieldType: string | null;
            oldValue: string | null;
            newValue: string | null;
            oldDisplayValue: string | null;
            newDisplayValue: string | null;
            isSensitive: boolean;
        }[];
    }>;
}
