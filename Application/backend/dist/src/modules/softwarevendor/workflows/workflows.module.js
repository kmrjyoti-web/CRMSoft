"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const workflow_admin_controller_1 = require("./presentation/workflow-admin.controller");
const workflow_config_controller_1 = require("./presentation/workflow-config.controller");
const workflow_execution_controller_1 = require("./presentation/workflow-execution.controller");
const workflow_approval_controller_1 = require("./presentation/workflow-approval.controller");
const workflow_ai_controller_1 = require("./presentation/workflow-ai.controller");
const workflow_ai_service_1 = require("./services/workflow-ai.service");
const create_workflow_handler_1 = require("./application/commands/create-workflow/create-workflow.handler");
const update_workflow_handler_1 = require("./application/commands/update-workflow/update-workflow.handler");
const publish_workflow_handler_1 = require("./application/commands/publish-workflow/publish-workflow.handler");
const clone_workflow_handler_1 = require("./application/commands/clone-workflow/clone-workflow.handler");
const validate_workflow_handler_1 = require("./application/commands/validate-workflow/validate-workflow.handler");
const add_state_handler_1 = require("./application/commands/add-state/add-state.handler");
const update_state_handler_1 = require("./application/commands/update-state/update-state.handler");
const remove_state_handler_1 = require("./application/commands/remove-state/remove-state.handler");
const add_transition_handler_1 = require("./application/commands/add-transition/add-transition.handler");
const update_transition_handler_1 = require("./application/commands/update-transition/update-transition.handler");
const remove_transition_handler_1 = require("./application/commands/remove-transition/remove-transition.handler");
const initialize_workflow_handler_1 = require("./application/commands/initialize-workflow/initialize-workflow.handler");
const execute_transition_handler_1 = require("./application/commands/execute-transition/execute-transition.handler");
const rollback_transition_handler_1 = require("./application/commands/rollback-transition/rollback-transition.handler");
const approve_transition_handler_1 = require("./application/commands/approve-transition/approve-transition.handler");
const reject_transition_handler_1 = require("./application/commands/reject-transition/reject-transition.handler");
const get_workflow_list_handler_1 = require("./application/queries/get-workflow-list/get-workflow-list.handler");
const get_workflow_by_id_handler_1 = require("./application/queries/get-workflow-by-id/get-workflow-by-id.handler");
const get_workflow_visual_handler_1 = require("./application/queries/get-workflow-visual/get-workflow-visual.handler");
const get_instance_handler_1 = require("./application/queries/get-instance/get-instance.handler");
const get_entity_status_handler_1 = require("./application/queries/get-entity-status/get-entity-status.handler");
const get_instance_transitions_handler_1 = require("./application/queries/get-instance-transitions/get-instance-transitions.handler");
const get_instance_history_handler_1 = require("./application/queries/get-instance-history/get-instance-history.handler");
const get_workflow_stats_handler_1 = require("./application/queries/get-workflow-stats/get-workflow-stats.handler");
const get_pending_approvals_handler_1 = require("./application/queries/get-pending-approvals/get-pending-approvals.handler");
const get_approval_by_id_handler_1 = require("./application/queries/get-approval-by-id/get-approval-by-id.handler");
const get_approval_history_handler_1 = require("./application/queries/get-approval-history/get-approval-history.handler");
const CommandHandlers = [
    create_workflow_handler_1.CreateWorkflowHandler, update_workflow_handler_1.UpdateWorkflowHandler, publish_workflow_handler_1.PublishWorkflowHandler,
    clone_workflow_handler_1.CloneWorkflowHandler, validate_workflow_handler_1.ValidateWorkflowHandler,
    add_state_handler_1.AddStateHandler, update_state_handler_1.UpdateStateHandler, remove_state_handler_1.RemoveStateHandler,
    add_transition_handler_1.AddTransitionHandler, update_transition_handler_1.UpdateTransitionHandler, remove_transition_handler_1.RemoveTransitionHandler,
    initialize_workflow_handler_1.InitializeWorkflowHandler, execute_transition_handler_1.ExecuteTransitionHandler, rollback_transition_handler_1.RollbackTransitionHandler,
    approve_transition_handler_1.ApproveTransitionHandler, reject_transition_handler_1.RejectTransitionHandler,
];
const QueryHandlers = [
    get_workflow_list_handler_1.GetWorkflowListHandler, get_workflow_by_id_handler_1.GetWorkflowByIdHandler, get_workflow_visual_handler_1.GetWorkflowVisualHandler,
    get_instance_handler_1.GetInstanceHandler, get_entity_status_handler_1.GetEntityStatusHandler, get_instance_transitions_handler_1.GetInstanceTransitionsHandler,
    get_instance_history_handler_1.GetInstanceHistoryHandler, get_workflow_stats_handler_1.GetWorkflowStatsHandler,
    get_pending_approvals_handler_1.GetPendingApprovalsHandler, get_approval_by_id_handler_1.GetApprovalByIdHandler, get_approval_history_handler_1.GetApprovalHistoryHandler,
];
let WorkflowsModule = class WorkflowsModule {
};
exports.WorkflowsModule = WorkflowsModule;
exports.WorkflowsModule = WorkflowsModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [
            workflow_admin_controller_1.WorkflowAdminController,
            workflow_config_controller_1.WorkflowConfigController,
            workflow_execution_controller_1.WorkflowExecutionController,
            workflow_approval_controller_1.WorkflowApprovalController,
            workflow_ai_controller_1.WorkflowAiController,
        ],
        providers: [...CommandHandlers, ...QueryHandlers, workflow_ai_service_1.WorkflowAiService],
    })
], WorkflowsModule);
//# sourceMappingURL=workflows.module.js.map