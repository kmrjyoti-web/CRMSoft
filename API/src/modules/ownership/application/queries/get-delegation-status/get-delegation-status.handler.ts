import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetDelegationStatusQuery } from './get-delegation-status.query';
import { DelegationService } from '../../../services/delegation.service';

@QueryHandler(GetDelegationStatusQuery)
export class GetDelegationStatusHandler implements IQueryHandler<GetDelegationStatusQuery> {
  constructor(private readonly delegation: DelegationService) {}

  async execute(query: GetDelegationStatusQuery) {
    return this.delegation.getDelegationStatus({ userId: query.userId, isActive: query.isActive });
  }
}
