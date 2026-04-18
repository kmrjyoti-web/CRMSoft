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
exports.SupportTicketController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const api_response_1 = require("../../../../common/utils/api-response");
const support_ticket_service_1 = require("../services/support-ticket.service");
const ticket_context_service_1 = require("../services/ticket-context.service");
const create_ticket_dto_1 = require("./dto/create-ticket.dto");
let SupportTicketController = class SupportTicketController {
    constructor(ticketService, contextService) {
        this.ticketService = ticketService;
        this.contextService = contextService;
    }
    async create(body, req) {
        const user = req.user;
        const autoContext = await this.contextService.captureContext(user.id, user.tenantId, req.headers['user-agent'], req.headers.referer);
        const ticket = await this.ticketService.create({
            tenantId: user.tenantId,
            reportedById: user.id,
            reportedByName: user.name,
            reportedByEmail: user.email,
            tenantName: user.tenantName,
            subject: body.subject,
            description: body.description,
            category: body.category,
            priority: body.priority,
            screenshots: body.screenshots,
            autoContext,
            linkedErrorIds: body.linkedErrorIds,
        });
        return api_response_1.ApiResponse.success(ticket);
    }
    async list(req, page, limit, status) {
        const result = await this.ticketService.findByTenant(req.user.tenantId, {
            page: page ? +page : undefined,
            limit: limit ? +limit : undefined,
            status,
        });
        return api_response_1.ApiResponse.success(result);
    }
    async getById(id, req) {
        const ticket = await this.ticketService.findById(id);
        if (!ticket || ticket.tenantId !== req.user.tenantId) {
            return api_response_1.ApiResponse.error('Ticket not found');
        }
        const messages = ticket.messages.filter((m) => !m.isInternal);
        return api_response_1.ApiResponse.success({ ...ticket, messages });
    }
    async addMessage(id, body, req) {
        const result = await this.ticketService.addMessage(id, {
            senderId: req.user.id,
            senderName: req.user.name,
            senderType: 'CUSTOMER',
            message: body.message,
            attachments: body.attachments,
        });
        return api_response_1.ApiResponse.success(result);
    }
    async close(id) {
        const result = await this.ticketService.closeTicket(id);
        return api_response_1.ApiResponse.success(result);
    }
    async rate(id, body) {
        const result = await this.ticketService.rateTicket(id, body.rating, body.comment);
        return api_response_1.ApiResponse.success(result);
    }
};
exports.SupportTicketController = SupportTicketController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a support ticket' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ticket_dto_1.CreateTicketDto, Object]),
    __metadata("design:returntype", Promise)
], SupportTicketController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List my tenant tickets' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String]),
    __metadata("design:returntype", Promise)
], SupportTicketController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get ticket by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SupportTicketController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(':id/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Add message to ticket' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SupportTicketController.prototype, "addMessage", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    (0, swagger_1.ApiOperation)({ summary: 'Close ticket' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SupportTicketController.prototype, "close", null);
__decorate([
    (0, common_1.Post)(':id/rate'),
    (0, swagger_1.ApiOperation)({ summary: 'Rate resolved ticket' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SupportTicketController.prototype, "rate", null);
exports.SupportTicketController = SupportTicketController = __decorate([
    (0, swagger_1.ApiTags)('Support Tickets'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('support/tickets'),
    __metadata("design:paramtypes", [support_ticket_service_1.SupportTicketService,
        ticket_context_service_1.TicketContextService])
], SupportTicketController);
//# sourceMappingURL=support-ticket.controller.js.map