import { IQueryHandler } from '@nestjs/cqrs';
import { GetTestRunQuery } from './get-test-run.query';
import { ITestRunRepository } from '../../../infrastructure/repositories/test-run.repository';
export declare class GetTestRunHandler implements IQueryHandler<GetTestRunQuery> {
    private readonly repo;
    private readonly logger;
    constructor(repo: ITestRunRepository);
    execute(query: GetTestRunQuery): Promise<Record<string, unknown>>;
}
