import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { WorkflowEngineService } from '../../../../../../core/workflow/workflow-engine.service';
import { RejectTransitionCommand } from './reject-transition.command';
import { CrossService } from '../../../../../../common/decorators/cross-service.decorator';

@CrossService('work', 'Uses WorkflowEngineService from core/workflow (Work service) to execute tenant workflow state transitions')
@CommandHandler(RejectTransitionCommand)
export class RejectTransitionHandler implements ICommandHandler<RejectTransitionCommand> {
    private readonly logger = new Logger(RejectTransitionHandler.name);

  constructor(private readonly engine: WorkflowEngineService) {}

  async execute(cmd: RejectTransitionCommand) {
    try {
      return this.engine.rejectTransition(cmd.approvalId, cmd.userId, cmd.comment);
    } catch (error) {
      this.logger.error(`RejectTransitionHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
