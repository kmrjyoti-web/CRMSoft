import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { WorkflowEngineService } from '../../../../../../core/workflow/workflow-engine.service';
import { InitializeWorkflowCommand } from './initialize-workflow.command';

@CommandHandler(InitializeWorkflowCommand)
export class InitializeWorkflowHandler implements ICommandHandler<InitializeWorkflowCommand> {
  constructor(private readonly engine: WorkflowEngineService) {}

  async execute(cmd: InitializeWorkflowCommand) {
    return this.engine.initializeWorkflow(cmd.entityType, cmd.entityId, cmd.userId, cmd.workflowId);
  }
}
