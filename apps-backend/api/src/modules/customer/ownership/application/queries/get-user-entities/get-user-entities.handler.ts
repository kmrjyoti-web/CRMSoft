import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetUserEntitiesQuery } from './get-user-entities.query';
import { OwnershipCoreService } from '../../../services/ownership-core.service';

@QueryHandler(GetUserEntitiesQuery)
export class GetUserEntitiesHandler implements IQueryHandler<GetUserEntitiesQuery> {
    private readonly logger = new Logger(GetUserEntitiesHandler.name);

  constructor(private readonly ownershipCore: OwnershipCoreService) {}

  async execute(query: GetUserEntitiesQuery) {
    try {
      return this.ownershipCore.getUserEntities({
        userId: query.userId, entityType: query.entityType,
        ownerType: query.ownerType, isActive: query.isActive,
      });
    } catch (error) {
      this.logger.error(`GetUserEntitiesHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
