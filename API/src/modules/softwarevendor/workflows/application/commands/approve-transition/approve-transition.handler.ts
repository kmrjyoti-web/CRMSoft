import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { WorkflowEngineService } from '../../../../../../core/workflow/workflow-engine.service';
import { ApproveTransitionCommand } from './approve-transition.command';
import { CrossService } from '../../../../../../common/decorators/cross-service.decorator';

@CrossService('work', 'Uses WorkflowEngineService from core/workflow (Work service) to execute tenant workflow state transitions')
@CommandHandler(ApproveTransitionCommand)
export class ApproveTransitionHandler implements ICommandHandler<ApproveTransitionCommand> {
  constructor(private readonly engine: WorkflowEngineService) {}

  async execute(cmd: ApproveTransitionCommand) {
    return this.engine.approveTransition(cmd.approvalId, cmd.userId, cmd.comment);
  }
}
