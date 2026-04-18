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
exports.QuotationTemplatesController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const passport_1 = require("@nestjs/passport");
const api_response_1 = require("../../../../common/utils/api-response");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const get_templates_query_1 = require("../application/queries/get-templates/get-templates.query");
const create_from_template_command_1 = require("../application/commands/create-from-template/create-from-template.command");
let QuotationTemplatesController = class QuotationTemplatesController {
    constructor(commandBus, queryBus, prisma) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.prisma = prisma;
    }
    async create(dto, user) {
        const template = await this.prisma.working.quotationTemplate.create({
            data: {
                name: dto.name, description: dto.description, industry: dto.industry,
                defaultItems: dto.defaultItems, defaultTerms: dto.defaultTerms,
                defaultPayment: dto.defaultPayment, defaultDelivery: dto.defaultDelivery,
                defaultWarranty: dto.defaultWarranty, coverNote: dto.coverNote,
                createdById: user.id,
            },
        });
        return api_response_1.ApiResponse.success(template, 'Template created');
    }
    async list(industry, search) {
        const result = await this.queryBus.execute(new get_templates_query_1.GetTemplatesQuery(industry, search));
        return api_response_1.ApiResponse.success(result);
    }
    async update(id, dto) {
        const template = await this.prisma.working.quotationTemplate.update({
            where: { id },
            data: {
                name: dto.name, description: dto.description, industry: dto.industry,
                defaultItems: dto.defaultItems, defaultTerms: dto.defaultTerms,
                defaultPayment: dto.defaultPayment, defaultDelivery: dto.defaultDelivery,
                defaultWarranty: dto.defaultWarranty, coverNote: dto.coverNote,
                isActive: dto.isActive,
            },
        });
        return api_response_1.ApiResponse.success(template, 'Template updated');
    }
    async createFromTemplate(templateId, leadId, user) {
        const result = await this.commandBus.execute(new create_from_template_command_1.CreateFromTemplateCommand(templateId, leadId, user.id, `${user.firstName} ${user.lastName}`));
        return api_response_1.ApiResponse.success(result, 'Quotation created from template');
    }
};
exports.QuotationTemplatesController = QuotationTemplatesController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], QuotationTemplatesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:read'),
    __param(0, (0, common_1.Query)('industry')),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], QuotationTemplatesController.prototype, "list", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuotationTemplatesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/create-quotation'),
    (0, require_permissions_decorator_1.RequirePermissions)('quotations:create'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('leadId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], QuotationTemplatesController.prototype, "createFromTemplate", null);
exports.QuotationTemplatesController = QuotationTemplatesController = __decorate([
    (0, common_1.Controller)('quotation-templates'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        prisma_service_1.PrismaService])
], QuotationTemplatesController);
//# sourceMappingURL=quotation-templates.controller.js.map