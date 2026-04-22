import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { WorkflowEngineService } from '../../../../../../core/workflow/workflow-engine.service';
import { ApproveTransitionCommand } from './approve-transition.command';
import { CrossService } from '../../../../../../common/decorators/cross-service.decorator';

@CrossService('work', 'Uses WorkflowEngineService from core/workflow (Work service) to execute tenant workflow state transitions')
@CommandHandler(ApproveTransitionCommand)
export class ApproveTransitionHandler implements ICommandHandler<ApproveTransitionCommand> {
    private readonly logger = new Logger(ApproveTransitionHandler.name);

  constructor(private readonly engine: WorkflowEngineService) {}

  async execute(cmd: ApproveTransitionCommand) {
    try {
      return this.engine.approveTransition(cmd.approvalId, cmd.userId, cmd.comment);
    } catch (error) {
      this.logger.error(`ApproveTransitionHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
