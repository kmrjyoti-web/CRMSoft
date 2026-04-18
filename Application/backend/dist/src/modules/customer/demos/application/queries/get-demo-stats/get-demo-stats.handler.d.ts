import { IQueryHandler } from '@nestjs/cqrs';
import { GetDemoStatsQuery } from './get-demo-stats.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class GetDemoStatsHandler implements IQueryHandler<GetDemoStatsQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetDemoStatsQuery): Promise<{
        total: number;
        byStatus: {
            status: import("@prisma/working-client").$Enums.DemoStatus;
            count: number;
        }[];
        byResult: {
            result: import("@prisma/working-client").$Enums.DemoResult | null;
            count: number;
        }[];
    }>;
}
