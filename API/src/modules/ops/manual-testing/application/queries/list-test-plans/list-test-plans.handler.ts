import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListTestPlansQuery } from './list-test-plans.query';
import { TEST_PLAN_REPOSITORY, ITestPlanRepository } from '../../../infrastructure/repositories/test-plan.repository';

@QueryHandler(ListTestPlansQuery)
export class ListTestPlansHandler implements IQueryHandler<ListTestPlansQuery> {
  constructor(
    @Inject(TEST_PLAN_REPOSITORY)
    private readonly repo: ITestPlanRepository,
  ) {}

  async execute(query: ListTestPlansQuery): Promise<any> {
    const { items, total } = await this.repo.findByTenantId(query.tenantId, {
      status: query.status,
      search: query.search,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
    return {
      data: items,
      meta: {
        total,
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        totalPages: Math.ceil(total / (query.limit ?? 20)),
      },
    };
  }
}
