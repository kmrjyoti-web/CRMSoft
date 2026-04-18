import { IQueryHandler } from '@nestjs/cqrs';
import { GetTeamTasksOverviewQuery } from './get-team-tasks-overview.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { TaskAssignmentService } from '../../services/task-assignment.service';
export declare class GetTeamTasksOverviewHandler implements IQueryHandler<GetTeamTasksOverviewQuery> {
    private readonly prisma;
    private readonly assignmentService;
    private readonly logger;
    constructor(prisma: PrismaService, assignmentService: TaskAssignmentService);
    execute(query: GetTeamTasksOverviewQuery): Promise<{
        userId: string;
        userName: string;
        pending: number;
        inProgress: number;
        overdue: number;
        onHold: number;
        completedThisWeek: number;
    }[]>;
}
