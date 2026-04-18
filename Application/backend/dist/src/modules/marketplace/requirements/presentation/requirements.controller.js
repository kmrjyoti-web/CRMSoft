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
exports.RequirementsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const post_requirement_command_1 = require("../application/commands/post-requirement/post-requirement.command");
const submit_quote_command_1 = require("../application/commands/submit-quote/submit-quote.command");
const accept_quote_command_1 = require("../application/commands/accept-quote/accept-quote.command");
const reject_quote_command_1 = require("../application/commands/reject-quote/reject-quote.command");
const list_requirements_query_1 = require("../application/queries/list-requirements/list-requirements.query");
const get_requirement_quotes_query_1 = require("../application/queries/get-requirement-quotes/get-requirement-quotes.query");
const post_requirement_dto_1 = require("./dto/post-requirement.dto");
const submit_quote_dto_1 = require("./dto/submit-quote.dto");
let RequirementsController = class RequirementsController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async postRequirement(dto, userId, tenantId) {
        const id = await this.commandBus.execute(new post_requirement_command_1.PostRequirementCommand(tenantId, userId, dto.title, dto.description, dto.categoryId, dto.quantity, dto.targetPrice, dto.currency, dto.deadline ? new Date(dto.deadline) : undefined, dto.mediaUrls, undefined, dto.keywords));
        return api_response_1.ApiResponse.success({ id }, 'Requirement posted');
    }
    async listRequirements(tenantId, page, limit, categoryId, authorId, search) {
        const result = await this.queryBus.execute(new list_requirements_query_1.ListRequirementsQuery(tenantId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20, categoryId, authorId, search));
        return api_response_1.ApiResponse.paginated(result.data, result.meta.total, result.meta.page, result.meta.limit);
    }
    async getRequirement(id, tenantId) {
        const result = await this.queryBus.execute(new list_requirements_query_1.ListRequirementsQuery(tenantId, 1, 1, undefined, undefined, undefined));
        const item = result.data.find((r) => r.id === id);
        return api_response_1.ApiResponse.success(item ?? null);
    }
    async submitQuote(requirementId, dto, userId, tenantId) {
        const quoteId = await this.commandBus.execute(new submit_quote_command_1.SubmitQuoteCommand(requirementId, userId, tenantId, dto.pricePerUnit, dto.quantity, dto.deliveryDays, dto.creditDays, dto.notes, dto.certifications));
        return api_response_1.ApiResponse.success({ id: quoteId }, 'Quote submitted');
    }
    async getQuotes(requirementId, tenantId, page, limit) {
        const result = await this.queryBus.execute(new get_requirement_quotes_query_1.GetRequirementQuotesQuery(requirementId, tenantId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20));
        return api_response_1.ApiResponse.paginated(result.data, result.meta.total, result.meta.page, result.meta.limit);
    }
    async acceptQuote(requirementId, quoteId, userId, tenantId) {
        const result = await this.commandBus.execute(new accept_quote_command_1.AcceptQuoteCommand(requirementId, quoteId, tenantId, userId));
        return api_response_1.ApiResponse.success(result, 'Quote accepted');
    }
    async rejectQuote(requirementId, quoteId, userId, tenantId) {
        const result = await this.commandBus.execute(new reject_quote_command_1.RejectQuoteCommand(requirementId, quoteId, tenantId, userId));
        return api_response_1.ApiResponse.success(result, 'Quote rejected');
    }
};
exports.RequirementsController = RequirementsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Post a new buyer requirement' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [post_requirement_dto_1.PostRequirementDto, String, String]),
    __metadata("design:returntype", Promise)
], RequirementsController.prototype, "postRequirement", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all requirements' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('categoryId')),
    __param(4, (0, common_1.Query)('authorId')),
    __param(5, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], RequirementsController.prototype, "listRequirements", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a requirement by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RequirementsController.prototype, "getRequirement", null);
__decorate([
    (0, common_1.Post)(':id/quote'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a quote for a requirement' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, submit_quote_dto_1.SubmitQuoteDto, String, String]),
    __metadata("design:returntype", Promise)
], RequirementsController.prototype, "submitQuote", null);
__decorate([
    (0, common_1.Get)(':id/quotes'),
    (0, swagger_1.ApiOperation)({ summary: 'List all quotes for a requirement' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], RequirementsController.prototype, "getQuotes", null);
__decorate([
    (0, common_1.Post)(':id/accept/:quoteId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Accept a quote' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('quoteId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], RequirementsController.prototype, "acceptQuote", null);
__decorate([
    (0, common_1.Post)(':id/reject/:quoteId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a quote' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('quoteId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], RequirementsController.prototype, "rejectQuote", null);
exports.RequirementsController = RequirementsController = __decorate([
    (0, swagger_1.ApiTags)('Marketplace - Requirements'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('marketplace/requirements'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], RequirementsController);
//# sourceMappingURL=requirements.controller.js.map