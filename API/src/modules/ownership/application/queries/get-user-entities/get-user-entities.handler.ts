import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserEntitiesQuery } from './get-user-entities.query';
import { OwnershipCoreService } from '../../../services/ownership-core.service';

@QueryHandler(GetUserEntitiesQuery)
export class GetUserEntitiesHandler implements IQueryHandler<GetUserEntitiesQuery> {
  constructor(private readonly ownershipCore: OwnershipCoreService) {}

  async execute(query: GetUserEntitiesQuery) {
    return this.ownershipCore.getUserEntities({
      userId: query.userId, entityType: query.entityType,
      ownerType: query.ownerType, isActive: query.isActive,
    });
  }
}
