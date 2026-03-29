import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetPendingQuery } from './get-pending.query';
import { MakerCheckerEngine } from '../../../../../../core/permissions/engines/maker-checker.engine';
import { CrossService } from '../../../../../../common/decorators/cross-service.decorator';

@CrossService('identity', 'Uses MakerCheckerEngine from core/permissions to validate and record maker-checker decisions')
@QueryHandler(GetPendingQuery)
export class GetPendingHandler implements IQueryHandler<GetPendingQuery> {
  constructor(private readonly makerChecker: MakerCheckerEngine) {}

  async execute(query: GetPendingQuery) {
    return this.makerChecker.getPendingForRole(query.checkerRole);
  }
}
