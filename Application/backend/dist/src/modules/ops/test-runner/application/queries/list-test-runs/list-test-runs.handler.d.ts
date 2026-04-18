import { IQueryHandler } from '@nestjs/cqrs';
import { ListTestRunsQuery } from './list-test-runs.query';
import { ITestRunRepository } from '../../../infrastructure/repositories/test-run.repository';
export declare class ListTestRunsHandler implements IQueryHandler<ListTestRunsQuery> {
    private readonly repo;
    private readonly logger;
    constructor(repo: ITestRunRepository);
    execute(query: ListTestRunsQuery): Promise<Record<string, unknown>[]>;
}
