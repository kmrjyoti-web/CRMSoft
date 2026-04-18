import { IQueryHandler } from '@nestjs/cqrs';
import { GetScheduledTestQuery } from './get-scheduled-test.query';
import { IScheduledTestRepository } from '../../../infrastructure/repositories/scheduled-test.repository';
export declare class GetScheduledTestHandler implements IQueryHandler<GetScheduledTestQuery> {
    private readonly repo;
    private readonly logger;
    constructor(repo: IScheduledTestRepository);
    execute(query: GetScheduledTestQuery): Promise<any>;
}
