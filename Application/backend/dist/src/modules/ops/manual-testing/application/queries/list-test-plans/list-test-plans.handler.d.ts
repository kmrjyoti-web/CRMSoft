import { IQueryHandler } from '@nestjs/cqrs';
import { ListTestPlansQuery } from './list-test-plans.query';
import { ITestPlanRepository } from '../../../infrastructure/repositories/test-plan.repository';
export declare class ListTestPlansHandler implements IQueryHandler<ListTestPlansQuery> {
    private readonly repo;
    private readonly logger;
    constructor(repo: ITestPlanRepository);
    execute(query: ListTestPlansQuery): Promise<Record<string, unknown>>;
}
