"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalRequestsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const approval_requests_controller_1 = require("./presentation/approval-requests.controller");
const submit_approval_handler_1 = require("./application/commands/submit-approval/submit-approval.handler");
const approve_request_handler_1 = require("./application/commands/approve-request/approve-request.handler");
const reject_request_handler_1 = require("./application/commands/reject-request/reject-request.handler");
const get_pending_handler_1 = require("./application/queries/get-pending/get-pending.handler");
const get_my_requests_handler_1 = require("./application/queries/get-my-requests/get-my-requests.handler");
const get_request_detail_handler_1 = require("./application/queries/get-request-detail/get-request-detail.handler");
const CommandHandlers = [submit_approval_handler_1.SubmitApprovalHandler, approve_request_handler_1.ApproveRequestHandler, reject_request_handler_1.RejectRequestHandler];
const QueryHandlers = [get_pending_handler_1.GetPendingHandler, get_my_requests_handler_1.GetMyRequestsHandler, get_request_detail_handler_1.GetRequestDetailHandler];
let ApprovalRequestsModule = class ApprovalRequestsModule {
};
exports.ApprovalRequestsModule = ApprovalRequestsModule;
exports.ApprovalRequestsModule = ApprovalRequestsModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [approval_requests_controller_1.ApprovalRequestsController],
        providers: [...CommandHandlers, ...QueryHandlers],
    })
], ApprovalRequestsModule);
//# sourceMappingURL=approval-requests.module.js.map