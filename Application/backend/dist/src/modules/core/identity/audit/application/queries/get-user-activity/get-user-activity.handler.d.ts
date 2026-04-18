import { IQueryHandler } from '@nestjs/cqrs';
import { GetUserActivityQuery } from './get-user-activity.query';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class GetUserActivityHandler implements IQueryHandler<GetUserActivityQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetUserActivityQuery): Promise<{
        userId: string;
        activity: {
            id: string;
            entityType: import("@prisma/identity-client").$Enums.AuditEntityType;
            entityId: string;
            entityLabel: string | null;
            action: import("@prisma/identity-client").$Enums.AuditAction;
            summary: string;
            changeCount: number;
            module: string | null;
            createdAt: string;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
}
