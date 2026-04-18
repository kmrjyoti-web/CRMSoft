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
exports.ApprovalRequestsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const approval_request_dto_1 = require("./dto/approval-request.dto");
const submit_approval_command_1 = require("../application/commands/submit-approval/submit-approval.command");
const approve_request_command_1 = require("../application/commands/approve-request/approve-request.command");
const reject_request_command_1 = require("../application/commands/reject-request/reject-request.command");
const get_pending_query_1 = require("../application/queries/get-pending/get-pending.query");
const get_my_requests_query_1 = require("../application/queries/get-my-requests/get-my-requests.query");
const get_request_detail_query_1 = require("../application/queries/get-request-detail/get-request-detail.query");
let ApprovalRequestsController = class ApprovalRequestsController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async submit(dto, user) {
        const result = await this.commandBus.execute(new submit_approval_command_1.SubmitApprovalCommand(dto.entityType, dto.entityId, dto.action, user.id, user.role, user.roleLevel ?? 5, dto.payload, dto.makerNote));
        if (!result) {
            return api_response_1.ApiResponse.success(null, 'No approval required for this action');
        }
        return api_response_1.ApiResponse.success(result, 'Approval request submitted');
    }
    async approve(id, dto, user) {
        const result = await this.commandBus.execute(new approve_request_command_1.ApproveRequestCommand(id, user.id, user.role, dto.note));
        return api_response_1.ApiResponse.success(result, 'Request approved');
    }
    async reject(id, dto, user) {
        const result = await this.commandBus.execute(new reject_request_command_1.RejectRequestCommand(id, user.id, dto.note));
        return api_response_1.ApiResponse.success(result, 'Request rejected');
    }
    async getPending(user) {
        const result = await this.queryBus.execute(new get_pending_query_1.GetPendingQuery(user.role));
        return api_response_1.ApiResponse.success(result);
    }
    async getMyRequests(userId) {
        const result = await this.queryBus.execute(new get_my_requests_query_1.GetMyRequestsQuery(userId));
        return api_response_1.ApiResponse.success(result);
    }
    async getDetail(id) {
        const result = await this.queryBus.execute(new get_request_detail_query_1.GetRequestDetailQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
};
exports.ApprovalRequestsController = ApprovalRequestsController;
__decorate([
    (0, common_1.Post)('submit'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [approval_request_dto_1.SubmitApprovalDto, Object]),
    __metadata("design:returntype", Promise)
], ApprovalRequestsController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, approval_request_dto_1.ApproveRejectDto, Object]),
    __metadata("design:returntype", Promise)
], ApprovalRequestsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, approval_request_dto_1.ApproveRejectDto, Object]),
    __metadata("design:returntype", Promise)
], ApprovalRequestsController.prototype, "reject", null);
__decorate([
    (0, common_1.Get)('pending'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApprovalRequestsController.prototype, "getPending", null);
__decorate([
    (0, common_1.Get)('my-requests'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApprovalRequestsController.prototype, "getMyRequests", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApprovalRequestsController.prototype, "getDetail", null);
exports.ApprovalRequestsController = ApprovalRequestsController = __decorate([
    (0, common_1.Controller)('approval-requests'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], ApprovalRequestsController);
//# sourceMappingURL=approval-requests.controller.js.map