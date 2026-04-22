import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { WorkflowEngineService } from '../../../../../../core/workflow/workflow-engine.service';
import { ExecuteTransitionCommand } from './execute-transition.command';
import { CrossService } from '../../../../../../common/decorators/cross-service.decorator';

@CrossService('work', 'Uses WorkflowEngineService from core/workflow (Work service) to execute tenant workflow state transitions')
@CommandHandler(ExecuteTransitionCommand)
export class ExecuteTransitionHandler implements ICommandHandler<ExecuteTransitionCommand> {
    private readonly logger = new Logger(ExecuteTransitionHandler.name);

  constructor(private readonly engine: WorkflowEngineService) {}

  async execute(cmd: ExecuteTransitionCommand) {
    try {
      return this.engine.executeTransition(cmd.instanceId, cmd.transitionCode, cmd.userId, cmd.comment, cmd.data);
    } catch (error) {
      this.logger.error(`ExecuteTransitionHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
