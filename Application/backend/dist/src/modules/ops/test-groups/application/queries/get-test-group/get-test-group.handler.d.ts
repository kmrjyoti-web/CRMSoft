import { IQueryHandler } from '@nestjs/cqrs';
import { GetTestGroupQuery } from './get-test-group.query';
import { ITestGroupRepository } from '../../../infrastructure/repositories/test-group.repository';
export declare class GetTestGroupHandler implements IQueryHandler<GetTestGroupQuery> {
    private readonly repo;
    private readonly logger;
    constructor(repo: ITestGroupRepository);
    execute(query: GetTestGroupQuery): Promise<Record<string, unknown>>;
}
