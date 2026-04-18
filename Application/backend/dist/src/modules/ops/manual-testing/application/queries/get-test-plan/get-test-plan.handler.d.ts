import { IQueryHandler } from '@nestjs/cqrs';
import { GetTestPlanQuery } from './get-test-plan.query';
import { ITestPlanRepository } from '../../../infrastructure/repositories/test-plan.repository';
export declare class GetTestPlanHandler implements IQueryHandler<GetTestPlanQuery> {
    private readonly repo;
    private readonly logger;
    constructor(repo: ITestPlanRepository);
    execute(query: GetTestPlanQuery): Promise<Record<string, unknown>>;
}
