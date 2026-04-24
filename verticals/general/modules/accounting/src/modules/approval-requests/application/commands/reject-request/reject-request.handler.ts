import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { RejectRequestCommand } from './reject-request.command';
import { MakerCheckerEngine } from '../../../../../../core/permissions/engines/maker-checker.engine';
import { CrossService } from '../../../../../../common/decorators/cross-service.decorator';

@CrossService('identity', 'Uses MakerCheckerEngine from core/permissions to validate and record maker-checker decisions')
@CommandHandler(RejectRequestCommand)
export class RejectRequestHandler implements ICommandHandler<RejectRequestCommand> {
    private readonly logger = new Logger(RejectRequestHandler.name);

  constructor(private readonly makerChecker: MakerCheckerEngine) {}

  async execute(cmd: RejectRequestCommand) {
    try {
      return this.makerChecker.reject(cmd.requestId, cmd.checkerId, cmd.note);
    } catch (error) {
      this.logger.error(`RejectRequestHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
