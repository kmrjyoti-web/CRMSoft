import { IQueryHandler } from '@nestjs/cqrs';
import { GetTaskStatsQuery } from './get-task-stats.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { TaskVisibilityService } from '../../services/task-visibility.service';
export declare class GetTaskStatsHandler implements IQueryHandler<GetTaskStatsQuery> {
    private readonly prisma;
    private readonly visibility;
    private readonly logger;
    constructor(prisma: PrismaService, visibility: TaskVisibilityService);
    execute(query: GetTaskStatsQuery): Promise<{
        total: number;
        open: number;
        inProgress: number;
        completed: number;
        overdue: number;
        cancelled: number;
        onHold: number;
    }>;
}
