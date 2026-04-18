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
exports.QuotationsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const passport_1 = require("@nestjs/passport");
const api_response_1 = require("../../../../common/utils/api-response");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const create_quotation_dto_1 = require("./dto/create-quotation.dto");
const update_quotation_dto_1 = require("./dto/update-quotation.dto");
const add_line_item_dto_1 = require("./dto/add-line-item.dto");
const send_quotation_dto_1 = require("./dto/send-quotation.dto");
const log_negotiation_dto_1 = require("./dto/log-negotiation.dto");
const quotation_query_dto_1 = require("./dto/quotation-query.dto");
const create_quotation_command_1 = require("../application/commands/create-quotation/create-quotation.command");
const update_quotation_command_1 = require("../application/commands/update-quotation/update-quotation.command");
const add_line_item_command_1 = require("../application/commands/add-line-item/add-line-item.command");
const update_line_item_command_1 = require("../application/commands/update-line-item/update-line-item.command");
const remove_line_item_command_1 = require("../application/commands/remove-line-item/remove-line-item.command");
const recalculate_totals_command_1 = require("../application/commands/recalculate-totals/recalculate-totals.command");
const send_quotation_command_1 = require("../application/commands/send-quotation/send-quotation.command");
const mark_viewed_command_1 = require("../application/commands/mark-viewed/mark-viewed.command");
const accept_quotation_command_1 = require("../application/commands/accept-quotation/accept-quotation.command");
const reject_quotation_command_1 = require("../application/commands/reject-quotation/reject-quotation.command");
const revise_quotation_command_1 = require("../application/commands/revise-quotation/revise-quotation.command");
const cancel_quotation_command_1 = require("../application/commands/cancel-quotation/cancel-quotation.command");
const clone_quotation_command_1 = require("../application/commands/clone-quotation/clone-quotation.command");
const log_negotiation_command_1 = require("../application/commands/log-negotiation/log-negotiation.command");
const get_quotation_by_id_query_1 = require("../application/queries/get-quotation-by-id/get-quotation-by-id.query");
const list_quotations_query_1 = require("../application/queries/list-quotations/list-quotations.query");
const get_quotation_timeline_query_1 = require("../application/queries/get-quotation-timeline/get-quotation-timeline.query");
const get_quotation_versions_query_1 = require("../application/queries/get-quotation-versions/get-quotation-versions.query");
const get_negotiation_history_query_1 = require("../application/queries/get-negotiation-history/get-negotiation-history.query");
let QuotationsController = class QuotationsController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, user) {
        const result = await this.commandBus.execute(new create_quotation_command_1.CreateQuotationCommand(user.id, `${user.firstName} ${user.lastName}`, user.tenantId, dto.leadId, dto.contactPersonId, dto.organizationId, dto.title, dto.summary, dto.coverNote, dto.priceType, dto.minAmount, dto.maxAmount, dto.plusMinusPercent, dto.validFrom ? new Date(dto.validFrom) : undefined, dto.validUntil ? new Date(dto.validUntil) : undefined, dto.paymentTerms, dto.deliveryTerms, dto.warrantyTerms, dto.termsConditions, dto.discountType, dto.discountValue, dto.items, dto.tags, dto.internalNotes));
        return api_response_1.ApiResponse.success(result, 'Quotation created');
    }
    async list(query) {
        const result = await this.queryBus.execute(new list_quotations_query_1.ListQuotationsQuery(query.page, query.limit, query.sortBy, query.sortOrder, query.search, query.status, query.leadId, query.userId, query.dateFrom ? new Date(query.dateFrom) : undefined, query.dateTo ? new Date(query.dateTo) : undefined));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getById(id) {
        const result = await this.queryBus.execute(new get_quotation_by_id_query_1.GetQuotationByIdQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
    async update(id, dto, user) {
        const result = await this.commandBus.execute(new update_quotation_command_1.UpdateQuotationCommand(id, user.id, `${user.firstName} ${user.lastName}`, dto.title, dto.summary, dto.coverNote, dto.priceType, dto.minAmount, dto.maxAmount, dto.plusMinusPercent, dto.validFrom ? new Date(dto.validFrom) : undefined, dto.validUntil ? new Date(dto.validUntil) : undefined, dto.paymentTerms, dto.deliveryTerms, dto.warrantyTerms, dto.termsConditions, dto.discountType, dto.discountValue, dto.tags, dto.internalNotes));
        return api_response_1.ApiResponse.success(result, 'Quotation updated');
    }
    async cancel(id, user, reason) {
        const result = await this.commandBus.execute(new cancel_quotation_command_1.CancelQuotationCommand(id, user.id, `${user.firstName} ${user.lastName}`, reason));
        return api_response_1.ApiResponse.success(result, 'Quotation cancelled');
    }
    async addItem(id, dto, user) {
        const result = await this.commandBus.execute(new add_line_item_command_1.AddLineItemCommand(id, user.id, `${user.firstName} ${user.lastName}`, dto.productId, dto.productName, dto.description, dto.quantity, dto.unit, dto.unitPrice, dto.mrp, dto.discountType, dto.discountValue, dto.gstRate, dto.cessRate, dto.isOptional, dto.notes));
        return api_response_1.ApiResponse.success(result, 'Item added');
    }
    async updateItem(id, itemId, dto, user) {
        const result = await this.commandBus.execute(new update_line_item_command_1.UpdateLineItemCommand(id, itemId, user.id, `${user.firstName} ${user.lastName}`, dto.productName, dto.description, dto.quantity, dto.unit, dto.unitPrice, dto.discountType, dto.discountValue, dto.gstRate, dto.cessRate, dto.isOptional, dto.notes));
        return api_response_1.ApiResponse.success(result, 'Item updated');
    }
    async removeItem(id, itemId, user) {
        const result = await this.commandBus.execute(new remove_line_item_command_1.RemoveLineItemCommand(id, itemId, user.id, `${user.firstName} ${user.lastName}`));
        return api_response_1.ApiResponse.success(result, 'Item removed');
    }
    async recalculate(id, user) {
        const result = await this.commandBus.execute(new recalculate_totals_command_1.RecalculateTotalsCommand(id, user.id, `${user.firstName} ${user.lastName}`));
        return api_response_1.ApiResponse.success(result, 'Totals recalculated');
    }
    async send(id, dto, user) {
        const result = await this.commandBus.execute(new send_quotation_command_1.SendQuotationCommand(id, user.id, `${user.firstName} ${user.lastName}`, dto.channel, dto.receiverContactId, dto.receiverEmail, dto.receiverPhone, dto.message));
        return api_response_1.ApiResponse.success(result, 'Quotation sent');
    }
    async markViewed(id, sendLogId) {
        const result = await this.commandBus.execute(new mark_viewed_command_1.MarkViewedCommand(id, sendLogId));
        return api_response_1.ApiResponse.success(result, 'Marked as viewed');
    }
    async accept(id, user, note) {
        const result = await this.commandBus.execute(new accept_quotation_command_1.AcceptQuotationCommand(id, user.id, `${user.firstName} ${user.lastName}`, note));
        return api_response_1.ApiResponse.success(result, 'Quotation accepted');
    }
    async reject(id, user, reason) {
        const result = await this.commandBus.execute(new reject_quotation_command_1.RejectQuotationCommand(id, user.id, `${user.firstName} ${user.lastName}`, reason));
        return api_response_1.ApiResponse.success(result, 'Quotation rejected');
    }
    async revise(id, user) {
        const result = await this.commandBus.execute(new revise_quotation_command_1.ReviseQuotationCommand(id, user.id, `${user.firstName} ${user.lastName}`));
        return api_response_1.ApiResponse.success(result, 'Revision created');
    }
    async clone(id, user, leadId) {
        const result = await this.commandBus.execute(new clone_quotation_command_1.CloneQuotationCommand(id, user.id, `${user.firstName} ${user.lastName}`, leadId));
        return api_response_1.ApiResponse.success(result, 'Quotation cloned');
    }
    async logNegotiation(id, dto, user) {
        const result = await this.commandBus.execute(new log_negotiation_command_1.LogNegotiationCommand(id, user.id, `${user.firstName} ${user.lastName}`, dto.negotiationType, dto.customerRequirement, dto.customerBudget, dto.customerPriceExpected, dto.ourPrice, dto.proposedDiscount, dto.counterOfferAmount, dto.itemsAdded, dto.itemsRemoved, dto.itemsModified, dto.termsChanged, dto.note, dto.outcome, dto.contactPersonId, dto.contactPersonName));
        return api_response_1.ApiResponse.success(result, 'Negotiation logged');
    }
    async getNegotiations(id) {
        const result = await this.queryBus.execute(new get_negotiation_history_query_1.GetNegotiationHistoryQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
    async getTimeline(id) {
        const result = await this.queryBus.execute(new get_quotation_timeline_query_1.GetQuotationTimelineQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
    async getVersions(id) {
        const result = await this.queryBus.execute(new get_quotation_versions_query_1.GetQuotationVersionsQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
};
exports.QuotationsController = QuotationsController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_quotation_dto_1.CreateQuotationDto, Object]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quotation_query_dto_1.QuotationQueryDto]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "getById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_quotation_dto_1.UpdateQuotationDto, Object]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_line_item_dto_1.AddLineItemDto, Object]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "addItem", null);
__decorate([
    (0, common_1.Put)(':id/items/:itemId'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, add_line_item_dto_1.AddLineItemDto, Object]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)(':id/items/:itemId'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "removeItem", null);
__decorate([
    (0, common_1.Post)(':id/recalculate'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "recalculate", null);
__decorate([
    (0, common_1.Post)(':id/send'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, send_quotation_dto_1.SendQuotationDto, Object]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "send", null);
__decorate([
    (0, common_1.Post)(':id/mark-viewed'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('sendLogId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "markViewed", null);
__decorate([
    (0, common_1.Post)(':id/accept'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)('note')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "accept", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)(':id/revise'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:create'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "revise", null);
__decorate([
    (0, common_1.Post)(':id/clone'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:create'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)('leadId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "clone", null);
__decorate([
    (0, common_1.Post)(':id/negotiations'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, log_negotiation_dto_1.LogNegotiationDto, Object]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "logNegotiation", null);
__decorate([
    (0, common_1.Get)(':id/negotiations'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "getNegotiations", null);
__decorate([
    (0, common_1.Get)(':id/timeline'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "getTimeline", null);
__decorate([
    (0, common_1.Get)(':id/versions'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "getVersions", null);
exports.QuotationsController = QuotationsController = __decorate([
    (0, common_1.Controller)('quotations'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [cqrs_1.CommandBus, cqrs_1.QueryBus])
], QuotationsController);
//# sourceMappingURL=quotations.controller.js.map