import { IQueryHandler } from '@nestjs/cqrs';
import { GetManagerReminderStatsQuery } from './get-manager-reminder-stats.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class GetManagerReminderStatsHandler implements IQueryHandler<GetManagerReminderStatsQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetManagerReminderStatsQuery): Promise<{
        total: number;
        pending: number;
        sent: number;
        missed: number;
        snoozed: number;
        reporteeCount: number;
    }>;
    private getOwnStats;
}
