import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetOwnershipHistoryQuery } from './get-ownership-history.query';
import { OwnershipCoreService } from '../../../services/ownership-core.service';

@QueryHandler(GetOwnershipHistoryQuery)
export class GetOwnershipHistoryHandler implements IQueryHandler<GetOwnershipHistoryQuery> {
  constructor(private readonly ownershipCore: OwnershipCoreService) {}

  async execute(query: GetOwnershipHistoryQuery) {
    return this.ownershipCore.getHistory({
      entityType: query.entityType, entityId: query.entityId,
      page: query.page, limit: query.limit,
    });
  }
}
