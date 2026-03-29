import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetTestEnvQuery } from './get-test-env.query';
import {
  TEST_ENV_REPOSITORY,
  ITestEnvRepository,
} from '../../../infrastructure/repositories/test-env.repository';

@QueryHandler(GetTestEnvQuery)
export class GetTestEnvHandler implements IQueryHandler<GetTestEnvQuery> {
  constructor(
    @Inject(TEST_ENV_REPOSITORY)
    private readonly repo: ITestEnvRepository,
  ) {}

  async execute(query: GetTestEnvQuery) {
    const env = await this.repo.findById(query.id);
    if (!env) throw new NotFoundException(`TestEnvironment ${query.id} not found`);
    // Mask test DB password before returning
    if (env.testDbUrl) {
      env.testDbUrl = env.testDbUrl.replace(/:([^@]+)@/, ':***@');
    }
    return env;
  }
}
