import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { WorkflowEngineService } from '../../../../../../core/workflow/workflow-engine.service';
import { RejectTransitionCommand } from './reject-transition.command';

@CommandHandler(RejectTransitionCommand)
export class RejectTransitionHandler implements ICommandHandler<RejectTransitionCommand> {
  constructor(private readonly engine: WorkflowEngineService) {}

  async execute(cmd: RejectTransitionCommand) {
    return this.engine.rejectTransition(cmd.approvalId, cmd.userId, cmd.comment);
  }
}
