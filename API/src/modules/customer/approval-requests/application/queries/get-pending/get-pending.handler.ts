import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetPendingQuery } from './get-pending.query';
import { MakerCheckerEngine } from '../../../../../../core/permissions/engines/maker-checker.engine';

@QueryHandler(GetPendingQuery)
export class GetPendingHandler implements IQueryHandler<GetPendingQuery> {
  constructor(private readonly makerChecker: MakerCheckerEngine) {}

  async execute(query: GetPendingQuery) {
    return this.makerChecker.getPendingForRole(query.checkerRole);
  }
}
