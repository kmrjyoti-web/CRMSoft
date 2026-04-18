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
exports.DocumentTemplateController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const template_crud_service_1 = require("../services/template-crud.service");
const template_customization_service_1 = require("../services/template-customization.service");
const document_template_dto_1 = require("./dto/document-template.dto");
let DocumentTemplateController = class DocumentTemplateController {
    constructor(crudService, customizationService) {
        this.crudService = crudService;
        this.customizationService = customizationService;
    }
    async list(user, query) {
        const templates = await this.crudService.findAll({
            documentType: query.documentType,
            industryCode: query.industryCode || user.businessTypeCode,
            isActive: true,
        });
        return api_response_1.ApiResponse.success(templates);
    }
    async getByType(user, type) {
        const templates = await this.crudService.findByType(type, user.tenantId, user.businessTypeCode);
        return api_response_1.ApiResponse.success(templates);
    }
    async getById(id) {
        const template = await this.crudService.findById(id);
        return api_response_1.ApiResponse.success(template);
    }
    async customize(user, id, dto) {
        const result = await this.customizationService.saveCustomization(user.tenantId, id, dto);
        return api_response_1.ApiResponse.success(result, 'Template customization saved');
    }
    async getCustomization(user, id) {
        const customization = await this.customizationService.getCustomization(user.tenantId, id);
        return api_response_1.ApiResponse.success(customization);
    }
    async setDefault(user, id) {
        const template = await this.crudService.findById(id);
        const result = await this.crudService.setDefault(id, user.tenantId, template.documentType);
        return api_response_1.ApiResponse.success(result, 'Default template updated');
    }
};
exports.DocumentTemplateController = DocumentTemplateController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List templates available for tenant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, document_template_dto_1.TemplateQueryDto]),
    __metadata("design:returntype", Promise)
], DocumentTemplateController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('by-type/:type'),
    (0, swagger_1.ApiOperation)({ summary: 'Get templates filtered by document type' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentTemplateController.prototype, "getByType", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get template detail' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentTemplateController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)('customize/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Save tenant customization for a template' }),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, document_template_dto_1.CustomizeTemplateDto]),
    __metadata("design:returntype", Promise)
], DocumentTemplateController.prototype, "customize", null);
__decorate([
    (0, common_1.Get)(':id/customization'),
    (0, swagger_1.ApiOperation)({ summary: "Get tenant's customization for a template" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentTemplateController.prototype, "getCustomization", null);
__decorate([
    (0, common_1.Post)(':id/set-default'),
    (0, swagger_1.ApiOperation)({ summary: 'Set template as default for its document type' }),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentTemplateController.prototype, "setDefault", null);
exports.DocumentTemplateController = DocumentTemplateController = __decorate([
    (0, swagger_1.ApiTags)('Document Templates'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('document-templates'),
    __metadata("design:paramtypes", [template_crud_service_1.TemplateCrudService,
        template_customization_service_1.TemplateCustomizationService])
], DocumentTemplateController);
//# sourceMappingURL=document-template.controller.js.map