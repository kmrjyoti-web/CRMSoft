import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetTestGroupQuery } from './get-test-group.query';
import { TEST_GROUP_REPOSITORY, ITestGroupRepository } from '../../../infrastructure/repositories/test-group.repository';

@QueryHandler(GetTestGroupQuery)
export class GetTestGroupHandler implements IQueryHandler<GetTestGroupQuery> {
  constructor(
    @Inject(TEST_GROUP_REPOSITORY)
    private readonly repo: ITestGroupRepository,
  ) {}

  async execute(query: GetTestGroupQuery): Promise<any> {
    const group = await this.repo.findById(query.id);
    if (!group) throw new NotFoundException(`TestGroup not found: ${query.id}`);
    return group;
  }
}
