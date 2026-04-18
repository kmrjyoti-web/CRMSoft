import { IQueryHandler } from '@nestjs/cqrs';
import { GetDiffViewQuery } from './get-diff-view.query';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class GetDiffViewHandler implements IQueryHandler<GetDiffViewQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetDiffViewQuery): Promise<{
        auditLog: {
            id: string;
            action: import("@prisma/identity-client").$Enums.AuditAction;
            summary: string;
            performedByName: string | null;
            createdAt: string;
        };
        diff: {
            format: string;
            fields: {
                fieldName: string;
                fieldLabel: string | null;
                before: {
                    value: string | null;
                    display: string;
                };
                after: {
                    value: string | null;
                    display: string;
                };
                changeType: "ADDED" | "MODIFIED" | "REMOVED";
            }[];
            unchangedFieldCount: number;
        };
    }>;
}
