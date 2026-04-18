"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowExecutionController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const initialize_workflow_dto_1 = require("./dto/initialize-workflow.dto");
const execute_transition_dto_1 = require("./dto/execute-transition.dto");
const initialize_workflow_command_1 = require("../application/commands/initialize-workflow/initialize-workflow.command");
const execute_transition_command_1 = require("../application/commands/execute-transition/execute-transition.command");
const rollback_transition_command_1 = require("../application/commands/rollback-transition/rollback-transition.command");
const get_instance_query_1 = require("../application/queries/get-instance/get-instance.query");
const get_entity_status_query_1 = require("../application/queries/get-entity-status/get-entity-status.query");
const get_instance_transitions_query_1 = require("../application/queries/get-instance-transitions/get-instance-transitions.query");
const get_instance_history_query_1 = require("../application/queries/get-instance-history/get-instance-history.query");
const get_workflow_stats_query_1 = require("../application/queries/get-workflow-stats/get-workflow-stats.query");
let WorkflowExecutionController = class WorkflowExecutionController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async initialize(dto, userId) {
        const instance = await this.commandBus.execute(new initialize_workflow_command_1.InitializeWorkflowCommand(dto.entityType, dto.entityId, userId, dto.workflowId));
        return api_response_1.ApiResponse.success(instance, 'Workflow initialized');
    }
    async transition(dto, userId) {
        const result = await this.commandBus.execute(new execute_transition_command_1.ExecuteTransitionCommand(dto.instanceId, dto.transitionCode, userId, dto.comment, dto.data));
        return api_response_1.ApiResponse.success(result, 'Transition executed');
    }
    async getInstance(instanceId) {
        const instance = await this.queryBus.execute(new get_instance_query_1.GetInstanceQuery(instanceId));
        return api_response_1.ApiResponse.success(instance);
    }
    async getEntityStatus(entityType, entityId) {
        const status = await this.queryBus.execute(new get_entity_status_query_1.GetEntityStatusQuery(entityType, entityId));
        return api_response_1.ApiResponse.success(status);
    }
    async getTransitions(instanceId, userId) {
        const transitions = await this.queryBus.execute(new get_instance_transitions_query_1.GetInstanceTransitionsQuery(instanceId, userId));
        return api_response_1.ApiResponse.success(transitions);
    }
    async getHistory(instanceId) {
        const history = await this.queryBus.execute(new get_instance_history_query_1.GetInstanceHistoryQuery(instanceId));
        return api_response_1.ApiResponse.success(history);
    }
    async rollback(instanceId, userId, comment) {
        const result = await this.commandBus.execute(new rollback_transition_command_1.RollbackTransitionCommand(instanceId, userId, comment));
        return api_response_1.ApiResponse.success(result, 'Rolled back to previous state');
    }
    async getStats(entityType) {
        const stats = await this.queryBus.execute(new get_workflow_stats_query_1.GetWorkflowStatsQuery(entityType));
        return api_response_1.ApiResponse.success(stats);
    }
};
exports.WorkflowExecutionController = WorkflowExecutionController;
__decorate([
    (0, common_1.Post)('initialize'),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Initialize a workflow for an entity' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [initialize_workflow_dto_1.InitializeWorkflowDto, String]),
    __metadata("design:returntype", Promise)
], WorkflowExecutionController.prototype, "initialize", null);
__decorate([
    (0, common_1.Post)('transition'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Execute a workflow transition' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [execute_transition_dto_1.ExecuteTransitionDto, String]),
    __metadata("design:returntype", Promise)
], WorkflowExecutionController.prototype, "transition", null);
__decorate([
    (0, common_1.Get)('instance/:instanceId'),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get workflow instance details' }),
    __param(0, (0, common_1.Param)('instanceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowExecutionController.prototype, "getInstance", null);
__decorate([
    (0, common_1.Get)('entity/:entityType/:entityId'),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get workflow status for an entity' }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkflowExecutionController.prototype, "getEntityStatus", null);
__decorate([
    (0, common_1.Get)('instance/:instanceId/transitions'),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available transitions for an instance' }),
    __param(0, (0, common_1.Param)('instanceId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkflowExecutionController.prototype, "getTransitions", null);
__decorate([
    (0, common_1.Get)('instance/:instanceId/history'),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transition history for an instance' }),
    __param(0, (0, common_1.Param)('instanceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowExecutionController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Post)('instance/:instanceId/rollback'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Rollback to previous state' }),
    __param(0, (0, common_1.Param)('instanceId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)('comment')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowExecutionController.prototype, "rollback", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get workflow statistics' }),
    __param(0, (0, common_1.Query)('entityType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowExecutionController.prototype, "getStats", null);
exports.WorkflowExecutionController = WorkflowExecutionController = __decorate([
    (0, swagger_1.ApiTags)('Workflow Execution'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('workflow-execution'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], WorkflowExecutionController);
//# sourceMappingURL=workflow-execution.controller.js.map