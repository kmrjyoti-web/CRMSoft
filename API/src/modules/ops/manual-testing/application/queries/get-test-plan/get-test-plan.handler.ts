import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetTestPlanQuery } from './get-test-plan.query';
import { TEST_PLAN_REPOSITORY, ITestPlanRepository } from '../../../infrastructure/repositories/test-plan.repository';

@QueryHandler(GetTestPlanQuery)
export class GetTestPlanHandler implements IQueryHandler<GetTestPlanQuery> {
  constructor(
    @Inject(TEST_PLAN_REPOSITORY)
    private readonly repo: ITestPlanRepository,
  ) {}

  async execute(query: GetTestPlanQuery): Promise<any> {
    const plan = await this.repo.findById(query.id);
    if (!plan || plan.tenantId !== query.tenantId) {
      throw new NotFoundException('Test plan not found');
    }
    return plan;
  }
}
