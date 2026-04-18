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
exports.WorkflowConfigController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_state_dto_1 = require("./dto/create-state.dto");
const update_state_dto_1 = require("./dto/update-state.dto");
const create_transition_dto_1 = require("./dto/create-transition.dto");
const update_transition_dto_1 = require("./dto/update-transition.dto");
const add_state_command_1 = require("../application/commands/add-state/add-state.command");
const update_state_command_1 = require("../application/commands/update-state/update-state.command");
const remove_state_command_1 = require("../application/commands/remove-state/remove-state.command");
const add_transition_command_1 = require("../application/commands/add-transition/add-transition.command");
const update_transition_command_1 = require("../application/commands/update-transition/update-transition.command");
const remove_transition_command_1 = require("../application/commands/remove-transition/remove-transition.command");
let WorkflowConfigController = class WorkflowConfigController {
    constructor(commandBus) {
        this.commandBus = commandBus;
    }
    async addState(workflowId, dto) {
        const state = await this.commandBus.execute(new add_state_command_1.AddStateCommand(workflowId, dto.name, dto.code, dto.stateType, dto.category, dto.color, dto.icon, dto.sortOrder, dto.metadata));
        return api_response_1.ApiResponse.success(state, 'State added');
    }
    async updateState(stateId, dto) {
        const state = await this.commandBus.execute(new update_state_command_1.UpdateStateCommand(stateId, dto));
        return api_response_1.ApiResponse.success(state, 'State updated');
    }
    async removeState(stateId) {
        const result = await this.commandBus.execute(new remove_state_command_1.RemoveStateCommand(stateId));
        return api_response_1.ApiResponse.success(result, 'State removed');
    }
    async addTransition(workflowId, dto) {
        const transition = await this.commandBus.execute(new add_transition_command_1.AddTransitionCommand(workflowId, dto.fromStateId, dto.toStateId, dto.name, dto.code, dto.triggerType, dto.conditions, dto.actions, dto.requiredPermission, dto.requiredRole, dto.sortOrder));
        return api_response_1.ApiResponse.success(transition, 'Transition added');
    }
    async updateTransition(transitionId, dto) {
        const transition = await this.commandBus.execute(new update_transition_command_1.UpdateTransitionCommand(transitionId, dto));
        return api_response_1.ApiResponse.success(transition, 'Transition updated');
    }
    async removeTransition(transitionId) {
        const result = await this.commandBus.execute(new remove_transition_command_1.RemoveTransitionCommand(transitionId));
        return api_response_1.ApiResponse.success(result, 'Transition removed');
    }
};
exports.WorkflowConfigController = WorkflowConfigController;
__decorate([
    (0, common_1.Post)(':id/states'),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a state to workflow' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_state_dto_1.CreateStateDto]),
    __metadata("design:returntype", Promise)
], WorkflowConfigController.prototype, "addState", null);
__decorate([
    (0, common_1.Put)('states/:stateId'),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a workflow state' }),
    __param(0, (0, common_1.Param)('stateId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_state_dto_1.UpdateStateDto]),
    __metadata("design:returntype", Promise)
], WorkflowConfigController.prototype, "updateState", null);
__decorate([
    (0, common_1.Delete)('states/:stateId'),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a workflow state' }),
    __param(0, (0, common_1.Param)('stateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowConfigController.prototype, "removeState", null);
__decorate([
    (0, common_1.Post)(':id/transitions'),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a transition to workflow' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_transition_dto_1.CreateTransitionDto]),
    __metadata("design:returntype", Promise)
], WorkflowConfigController.prototype, "addTransition", null);
__decorate([
    (0, common_1.Put)('transitions/:transitionId'),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a workflow transition' }),
    __param(0, (0, common_1.Param)('transitionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_transition_dto_1.UpdateTransitionDto]),
    __metadata("design:returntype", Promise)
], WorkflowConfigController.prototype, "updateTransition", null);
__decorate([
    (0, common_1.Delete)('transitions/:transitionId'),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a workflow transition' }),
    __param(0, (0, common_1.Param)('transitionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowConfigController.prototype, "removeTransition", null);
exports.WorkflowConfigController = WorkflowConfigController = __decorate([
    (0, swagger_1.ApiTags)('Workflows - Config'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('workflows'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus])
], WorkflowConfigController);
//# sourceMappingURL=workflow-config.controller.js.map