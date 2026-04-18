import { IQueryHandler } from '@nestjs/cqrs';
import { ListScheduledTestRunsQuery } from './list-scheduled-test-runs.query';
import { IScheduledTestRepository } from '../../../infrastructure/repositories/scheduled-test.repository';
import { IScheduledTestRunRepository } from '../../../infrastructure/repositories/scheduled-test-run.repository';
export declare class ListScheduledTestRunsHandler implements IQueryHandler<ListScheduledTestRunsQuery> {
    private readonly testRepo;
    private readonly runRepo;
    private readonly logger;
    constructor(testRepo: IScheduledTestRepository, runRepo: IScheduledTestRunRepository);
    execute(query: ListScheduledTestRunsQuery): Promise<any[]>;
}
