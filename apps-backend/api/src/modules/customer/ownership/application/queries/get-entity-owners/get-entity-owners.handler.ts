import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetEntityOwnersQuery } from './get-entity-owners.query';
import { OwnershipCoreService } from '../../../services/ownership-core.service';

@QueryHandler(GetEntityOwnersQuery)
export class GetEntityOwnersHandler implements IQueryHandler<GetEntityOwnersQuery> {
    private readonly logger = new Logger(GetEntityOwnersHandler.name);

  constructor(private readonly ownershipCore: OwnershipCoreService) {}

  async execute(query: GetEntityOwnersQuery) {
    try {
      return this.ownershipCore.getEntityOwners(query.entityType, query.entityId);
    } catch (error) {
      this.logger.error(`GetEntityOwnersHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
