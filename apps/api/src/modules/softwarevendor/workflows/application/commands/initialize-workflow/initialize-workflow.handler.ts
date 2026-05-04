import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { WorkflowEngineService } from '../../../../../../core/workflow/workflow-engine.service';
import { InitializeWorkflowCommand } from './initialize-workflow.command';
import { CrossService } from '../../../../../../common/decorators/cross-service.decorator';

@CrossService('work', 'Uses WorkflowEngineService from core/workflow (Work service) to execute tenant workflow state transitions')
@CommandHandler(InitializeWorkflowCommand)
export class InitializeWorkflowHandler implements ICommandHandler<InitializeWorkflowCommand> {
    private readonly logger = new Logger(InitializeWorkflowHandler.name);

  constructor(private readonly engine: WorkflowEngineService) {}

  async execute(cmd: InitializeWorkflowCommand) {
    try {
      return this.engine.initializeWorkflow(cmd.entityType, cmd.entityId, cmd.userId, cmd.workflowId);
    } catch (error) {
      this.logger.error(`InitializeWorkflowHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
