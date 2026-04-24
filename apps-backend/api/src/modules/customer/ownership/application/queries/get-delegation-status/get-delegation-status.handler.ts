import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetDelegationStatusQuery } from './get-delegation-status.query';
import { DelegationService } from '../../../services/delegation.service';

@QueryHandler(GetDelegationStatusQuery)
export class GetDelegationStatusHandler implements IQueryHandler<GetDelegationStatusQuery> {
    private readonly logger = new Logger(GetDelegationStatusHandler.name);

  constructor(private readonly delegation: DelegationService) {}

  async execute(query: GetDelegationStatusQuery) {
    try {
      return this.delegation.getDelegationStatus({ userId: query.userId, isActive: query.isActive });
    } catch (error) {
      this.logger.error(`GetDelegationStatusHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
