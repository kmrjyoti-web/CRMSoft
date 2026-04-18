import { IQueryHandler } from '@nestjs/cqrs';
import { ListScheduledTestsQuery } from './list-scheduled-tests.query';
import { IScheduledTestRepository } from '../../../infrastructure/repositories/scheduled-test.repository';
export declare class ListScheduledTestsHandler implements IQueryHandler<ListScheduledTestsQuery> {
    private readonly repo;
    private readonly logger;
    constructor(repo: IScheduledTestRepository);
    execute(query: ListScheduledTestsQuery): Promise<{
        data: Record<string, unknown>[];
        total: number;
    }>;
}
