import { IQueryHandler } from '@nestjs/cqrs';
import { GetAuditStatsQuery } from './get-audit-stats.query';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class GetAuditStatsHandler implements IQueryHandler<GetAuditStatsQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetAuditStatsQuery): Promise<{
        totalChanges: number;
        byAction: Record<string, number>;
        byEntity: Record<string, number>;
        byUser: {
            userId: string | null;
            name: string;
            changes: number;
        }[];
        byModule: Record<string, number>;
        sensitiveChanges: number;
        systemChanges: number;
    }>;
}
