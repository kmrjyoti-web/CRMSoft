import { IQueryHandler } from '@nestjs/cqrs';
import { ListTestGroupsQuery } from './list-test-groups.query';
import { ITestGroupRepository } from '../../../infrastructure/repositories/test-group.repository';
export declare class ListTestGroupsHandler implements IQueryHandler<ListTestGroupsQuery> {
    private readonly repo;
    private readonly logger;
    constructor(repo: ITestGroupRepository);
    execute(query: ListTestGroupsQuery): Promise<Record<string, unknown>[]>;
}
