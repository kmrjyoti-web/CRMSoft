import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { WorkflowEngineService } from '../../../../../core/workflow/workflow-engine.service';
import { ExecuteTransitionCommand } from './execute-transition.command';

@CommandHandler(ExecuteTransitionCommand)
export class ExecuteTransitionHandler implements ICommandHandler<ExecuteTransitionCommand> {
  constructor(private readonly engine: WorkflowEngineService) {}

  async execute(cmd: ExecuteTransitionCommand) {
    return this.engine.executeTransition(cmd.instanceId, cmd.transitionCode, cmd.userId, cmd.comment, cmd.data);
  }
}
