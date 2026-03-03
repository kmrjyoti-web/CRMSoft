import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { WorkflowAdminController } from './presentation/workflow-admin.controller';
import { WorkflowConfigController } from './presentation/workflow-config.controller';
import { WorkflowExecutionController } from './presentation/workflow-execution.controller';
import { WorkflowApprovalController } from './presentation/workflow-approval.controller';

// Command Handlers
import { CreateWorkflowHandler } from './application/commands/create-workflow/create-workflow.handler';
import { UpdateWorkflowHandler } from './application/commands/update-workflow/update-workflow.handler';
import { PublishWorkflowHandler } from './application/commands/publish-workflow/publish-workflow.handler';
import { CloneWorkflowHandler } from './application/commands/clone-workflow/clone-workflow.handler';
import { ValidateWorkflowHandler } from './application/commands/validate-workflow/validate-workflow.handler';
import { AddStateHandler } from './application/commands/add-state/add-state.handler';
import { UpdateStateHandler } from './application/commands/update-state/update-state.handler';
import { RemoveStateHandler } from './application/commands/remove-state/remove-state.handler';
import { AddTransitionHandler } from './application/commands/add-transition/add-transition.handler';
import { UpdateTransitionHandler } from './application/commands/update-transition/update-transition.handler';
import { RemoveTransitionHandler } from './application/commands/remove-transition/remove-transition.handler';
import { InitializeWorkflowHandler } from './application/commands/initialize-workflow/initialize-workflow.handler';
import { ExecuteTransitionHandler } from './application/commands/execute-transition/execute-transition.handler';
import { RollbackTransitionHandler } from './application/commands/rollback-transition/rollback-transition.handler';
import { ApproveTransitionHandler } from './application/commands/approve-transition/approve-transition.handler';
import { RejectTransitionHandler } from './application/commands/reject-transition/reject-transition.handler';

// Query Handlers
import { GetWorkflowListHandler } from './application/queries/get-workflow-list/get-workflow-list.handler';
import { GetWorkflowByIdHandler } from './application/queries/get-workflow-by-id/get-workflow-by-id.handler';
import { GetWorkflowVisualHandler } from './application/queries/get-workflow-visual/get-workflow-visual.handler';
import { GetInstanceHandler } from './application/queries/get-instance/get-instance.handler';
import { GetEntityStatusHandler } from './application/queries/get-entity-status/get-entity-status.handler';
import { GetInstanceTransitionsHandler } from './application/queries/get-instance-transitions/get-instance-transitions.handler';
import { GetInstanceHistoryHandler } from './application/queries/get-instance-history/get-instance-history.handler';
import { GetWorkflowStatsHandler } from './application/queries/get-workflow-stats/get-workflow-stats.handler';
import { GetPendingApprovalsHandler } from './application/queries/get-pending-approvals/get-pending-approvals.handler';
import { GetApprovalByIdHandler } from './application/queries/get-approval-by-id/get-approval-by-id.handler';
import { GetApprovalHistoryHandler } from './application/queries/get-approval-history/get-approval-history.handler';

const CommandHandlers = [
  CreateWorkflowHandler, UpdateWorkflowHandler, PublishWorkflowHandler,
  CloneWorkflowHandler, ValidateWorkflowHandler,
  AddStateHandler, UpdateStateHandler, RemoveStateHandler,
  AddTransitionHandler, UpdateTransitionHandler, RemoveTransitionHandler,
  InitializeWorkflowHandler, ExecuteTransitionHandler, RollbackTransitionHandler,
  ApproveTransitionHandler, RejectTransitionHandler,
];

const QueryHandlers = [
  GetWorkflowListHandler, GetWorkflowByIdHandler, GetWorkflowVisualHandler,
  GetInstanceHandler, GetEntityStatusHandler, GetInstanceTransitionsHandler,
  GetInstanceHistoryHandler, GetWorkflowStatsHandler,
  GetPendingApprovalsHandler, GetApprovalByIdHandler, GetApprovalHistoryHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [
    WorkflowAdminController,
    WorkflowConfigController,
    WorkflowExecutionController,
    WorkflowApprovalController,
  ],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class WorkflowsModule {}
