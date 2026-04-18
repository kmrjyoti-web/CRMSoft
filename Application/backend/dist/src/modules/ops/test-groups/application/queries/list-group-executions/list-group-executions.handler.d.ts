import { IQueryHandler } from '@nestjs/cqrs';
import { ListGroupExecutionsQuery } from './list-group-executions.query';
import { ITestGroupRepository } from '../../../infrastructure/repositories/test-group.repository';
export declare class ListGroupExecutionsHandler implements IQueryHandler<ListGroupExecutionsQuery> {
    private readonly repo;
    private readonly logger;
    constructor(repo: ITestGroupRepository);
    execute(query: ListGroupExecutionsQuery): Promise<Record<string, unknown>[]>;
}
