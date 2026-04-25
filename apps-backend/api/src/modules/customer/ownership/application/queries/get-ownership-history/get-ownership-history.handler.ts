import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetOwnershipHistoryQuery } from './get-ownership-history.query';
import { OwnershipCoreService } from '../../../services/ownership-core.service';

@QueryHandler(GetOwnershipHistoryQuery)
export class GetOwnershipHistoryHandler implements IQueryHandler<GetOwnershipHistoryQuery> {
    private readonly logger = new Logger(GetOwnershipHistoryHandler.name);

  constructor(private readonly ownershipCore: OwnershipCoreService) {}

  async execute(query: GetOwnershipHistoryQuery) {
    try {
      return this.ownershipCore.getHistory({
        entityType: query.entityType, entityId: query.entityId,
        page: query.page, limit: query.limit,
      });
    } catch (error) {
      this.logger.error(`GetOwnershipHistoryHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
