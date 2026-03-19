import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetEntityOwnersQuery } from './get-entity-owners.query';
import { OwnershipCoreService } from '../../../services/ownership-core.service';

@QueryHandler(GetEntityOwnersQuery)
export class GetEntityOwnersHandler implements IQueryHandler<GetEntityOwnersQuery> {
  constructor(private readonly ownershipCore: OwnershipCoreService) {}

  async execute(query: GetEntityOwnersQuery) {
    return this.ownershipCore.getEntityOwners(query.entityType, query.entityId);
  }
}
