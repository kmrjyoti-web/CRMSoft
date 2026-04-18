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
exports.WorkflowApprovalController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const approve_reject_dto_1 = require("./dto/approve-reject.dto");
const approve_transition_command_1 = require("../application/commands/approve-transition/approve-transition.command");
const reject_transition_command_1 = require("../application/commands/reject-transition/reject-transition.command");
const get_pending_approvals_query_1 = require("../application/queries/get-pending-approvals/get-pending-approvals.query");
const get_approval_by_id_query_1 = require("../application/queries/get-approval-by-id/get-approval-by-id.query");
const get_approval_history_query_1 = require("../application/queries/get-approval-history/get-approval-history.query");
let WorkflowApprovalController = class WorkflowApprovalController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async getPending(userId) {
        const approvals = await this.queryBus.execute(new get_pending_approvals_query_1.GetPendingApprovalsQuery(userId));
        return api_response_1.ApiResponse.success(approvals);
    }
    async approve(id, dto, userId) {
        const result = await this.commandBus.execute(new approve_transition_command_1.ApproveTransitionCommand(id, userId, dto.comment));
        return api_response_1.ApiResponse.success(result, 'Transition approved');
    }
    async reject(id, dto, userId) {
        const result = await this.commandBus.execute(new reject_transition_command_1.RejectTransitionCommand(id, userId, dto.comment));
        return api_response_1.ApiResponse.success(result, 'Transition rejected');
    }
    async getById(id) {
        const approval = await this.queryBus.execute(new get_approval_by_id_query_1.GetApprovalByIdQuery(id));
        return api_response_1.ApiResponse.success(approval);
    }
    async getHistory(userId) {
        const history = await this.queryBus.execute(new get_approval_history_query_1.GetApprovalHistoryQuery(userId));
        return api_response_1.ApiResponse.success(history);
    }
};
exports.WorkflowApprovalController = WorkflowApprovalController;
__decorate([
    (0, common_1.Get)('pending'),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pending workflow approvals' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowApprovalController.prototype, "getPending", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a workflow transition' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, approve_reject_dto_1.ApproveRejectDto, String]),
    __metadata("design:returntype", Promise)
], WorkflowApprovalController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a workflow transition' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, approve_reject_dto_1.ApproveRejectDto, String]),
    __metadata("design:returntype", Promise)
], WorkflowApprovalController.prototype, "reject", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get approval details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowApprovalController.prototype, "getById", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, require_permissions_decorator_1.RequirePermissions)('workflows:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get approval history' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowApprovalController.prototype, "getHistory", null);
exports.WorkflowApprovalController = WorkflowApprovalController = __decorate([
    (0, swagger_1.ApiTags)('Workflow Approvals'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('workflow-approvals'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], WorkflowApprovalController);
//# sourceMappingURL=workflow-approval.controller.js.map