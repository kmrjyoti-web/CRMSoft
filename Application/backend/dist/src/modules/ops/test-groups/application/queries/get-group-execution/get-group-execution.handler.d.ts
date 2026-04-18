import { IQueryHandler } from '@nestjs/cqrs';
import { GetGroupExecutionQuery } from './get-group-execution.query';
import { ITestGroupRepository } from '../../../infrastructure/repositories/test-group.repository';
export declare class GetGroupExecutionHandler implements IQueryHandler<GetGroupExecutionQuery> {
    private readonly repo;
    private readonly logger;
    constructor(repo: ITestGroupRepository);
    execute(query: GetGroupExecutionQuery): Promise<Record<string, unknown>>;
}
