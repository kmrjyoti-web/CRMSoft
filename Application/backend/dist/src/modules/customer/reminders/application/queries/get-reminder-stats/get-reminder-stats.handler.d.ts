import { IQueryHandler } from '@nestjs/cqrs';
import { GetReminderStatsQuery } from './get-reminder-stats.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class GetReminderStatsHandler implements IQueryHandler<GetReminderStatsQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetReminderStatsQuery): Promise<{
        total: number;
        sent: number;
        pending: number;
        byChannel: {
            channel: import("@prisma/working-client").$Enums.ReminderChannel;
            count: number;
        }[];
    }>;
}
