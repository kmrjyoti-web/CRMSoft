import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetPendingQuery } from './get-pending.query';
import { MakerCheckerEngine } from '../../../../../../core/permissions/engines/maker-checker.engine';
import { CrossService } from '../../../../../../common/decorators/cross-service.decorator';

@CrossService('identity', 'Uses MakerCheckerEngine from core/permissions to validate and record maker-checker decisions')
@QueryHandler(GetPendingQuery)
export class GetPendingHandler implements IQueryHandler<GetPendingQuery> {
    private readonly logger = new Logger(GetPendingHandler.name);

  constructor(private readonly makerChecker: MakerCheckerEngine) {}

  async execute(query: GetPendingQuery) {
    try {
      return this.makerChecker.getPendingForRole(query.checkerRole);
    } catch (error) {
      this.logger.error(`GetPendingHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
