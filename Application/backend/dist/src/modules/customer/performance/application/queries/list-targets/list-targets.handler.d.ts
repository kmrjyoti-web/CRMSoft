import { IQueryHandler } from '@nestjs/cqrs';
import { ListTargetsQuery } from './list-targets.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class ListTargetsHandler implements IQueryHandler<ListTargetsQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: ListTargetsQuery): Promise<{
        data: {
            id: string;
            tenantId: string;
            name: string | null;
            isActive: boolean;
            createdById: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            notes: string | null;
            roleId: string | null;
            userId: string | null;
            periodStart: Date;
            periodEnd: Date;
            metric: import("@prisma/working-client").$Enums.TargetMetric;
            period: import("@prisma/working-client").$Enums.TargetPeriod;
            targetValue: import("@prisma/working-client/runtime/library").Decimal;
            currentValue: import("@prisma/working-client/runtime/library").Decimal;
            achievedPercent: import("@prisma/working-client/runtime/library").Decimal;
            lastCalculatedAt: Date | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
}
