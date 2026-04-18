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
exports.VendorSupportController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const vendor_guard_1 = require("../../../core/identity/tenant/infrastructure/vendor.guard");
const api_response_1 = require("../../../../common/utils/api-response");
const support_ticket_service_1 = require("../services/support-ticket.service");
let VendorSupportController = class VendorSupportController {
    constructor(ticketService) {
        this.ticketService = ticketService;
    }
    async getStats() {
        const result = await this.ticketService.getStats();
        return api_response_1.ApiResponse.success(result);
    }
    async list(page, limit, tenantId, status, priority, category, assignedToId) {
        const result = await this.ticketService.findAll({
            page: page ? +page : undefined,
            limit: limit ? +limit : undefined,
            tenantId,
            status,
            priority,
            category,
            assignedToId,
        });
        return api_response_1.ApiResponse.success(result);
    }
    async getById(id) {
        const ticket = await this.ticketService.findById(id);
        if (!ticket)
            return api_response_1.ApiResponse.error('Ticket not found');
        return api_response_1.ApiResponse.success(ticket);
    }
    async update(id, body) {
        const result = await this.ticketService.updateTicket(id, body);
        return api_response_1.ApiResponse.success(result);
    }
    async addMessage(id, body, req) {
        const result = await this.ticketService.addMessage(id, {
            senderId: req.user.id,
            senderName: req.user.name || req.user.email,
            senderType: 'VENDOR',
            message: body.message,
            attachments: body.attachments,
            isInternal: body.isInternal,
        });
        return api_response_1.ApiResponse.success(result);
    }
    async getContext(id) {
        const result = await this.ticketService.getContext(id);
        if (!result)
            return api_response_1.ApiResponse.error('Ticket not found');
        return api_response_1.ApiResponse.success(result);
    }
};
exports.VendorSupportController = VendorSupportController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get support ticket stats' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VendorSupportController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all support tickets (vendor view)' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('tenantId')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('priority')),
    __param(5, (0, common_1.Query)('category')),
    __param(6, (0, common_1.Query)('assignedToId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], VendorSupportController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get ticket detail (vendor view)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorSupportController.prototype, "getById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update ticket status/assignment/priority' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VendorSupportController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Add vendor message/internal note' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], VendorSupportController.prototype, "addMessage", null);
__decorate([
    (0, common_1.Get)(':id/context'),
    (0, swagger_1.ApiOperation)({ summary: 'Get auto-captured context and linked errors' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorSupportController.prototype, "getContext", null);
exports.VendorSupportController = VendorSupportController = __decorate([
    (0, swagger_1.ApiTags)('Vendor Support'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, vendor_guard_1.VendorGuard),
    (0, common_1.Controller)('vendor/support/tickets'),
    __metadata("design:paramtypes", [support_ticket_service_1.SupportTicketService])
], VendorSupportController);
//# sourceMappingURL=vendor-support.controller.js.map