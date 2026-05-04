import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ListTestEnvsQuery } from './list-test-envs.query';
import {
  TEST_ENV_REPOSITORY,
  ITestEnvRepository,
} from '../../../infrastructure/repositories/test-env.repository';

@QueryHandler(ListTestEnvsQuery)
export class ListTestEnvsHandler implements IQueryHandler<ListTestEnvsQuery> {
    private readonly logger = new Logger(ListTestEnvsHandler.name);

  constructor(
    @Inject(TEST_ENV_REPOSITORY)
    private readonly repo: ITestEnvRepository,
  ) {}

  async execute(query: ListTestEnvsQuery) {
    try {
      return this.repo.findByTenantId(query.tenantId, {
        status: query.status,
        page: query.page,
        limit: query.limit,
      });
    } catch (error) {
      this.logger.error(`ListTestEnvsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
