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
exports.VendorDocumentTemplateController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const vendor_guard_1 = require("../../../core/identity/tenant/infrastructure/vendor.guard");
const api_response_1 = require("../../../../common/utils/api-response");
const template_crud_service_1 = require("../services/template-crud.service");
const template_renderer_service_1 = require("../services/template-renderer.service");
const document_data_service_1 = require("../services/document-data.service");
const document_template_dto_1 = require("./dto/document-template.dto");
let VendorDocumentTemplateController = class VendorDocumentTemplateController {
    constructor(crudService, rendererService, dataService) {
        this.crudService = crudService;
        this.rendererService = rendererService;
        this.dataService = dataService;
    }
    async list(query) {
        const templates = await this.crudService.findAll({
            documentType: query.documentType,
            industryCode: query.industryCode,
            isActive: query.isActive,
            isSystem: query.isSystem,
        });
        return api_response_1.ApiResponse.success(templates);
    }
    async getById(id) {
        const template = await this.crudService.findById(id);
        return api_response_1.ApiResponse.success(template);
    }
    async create(dto) {
        const template = await this.crudService.create({
            code: dto.code,
            name: dto.name,
            description: dto.description,
            documentType: dto.documentType,
            htmlTemplate: dto.htmlTemplate,
            cssStyles: dto.cssStyles,
            defaultSettings: dto.defaultSettings ?? {},
            availableFields: dto.availableFields ?? [],
            industryCode: dto.industryCode,
            sortOrder: dto.sortOrder ?? 0,
            isDefault: dto.isDefault ?? false,
            isSystem: true,
        });
        return api_response_1.ApiResponse.success(template, 'Template created');
    }
    async update(id, dto) {
        const template = await this.crudService.update(id, dto);
        return api_response_1.ApiResponse.success(template, 'Template updated');
    }
    async archive(id) {
        const template = await this.crudService.archive(id);
        return api_response_1.ApiResponse.success(template, 'Template archived');
    }
    async duplicate(id) {
        const template = await this.crudService.duplicate(id);
        return api_response_1.ApiResponse.success(template, 'Template duplicated');
    }
    async preview(id) {
        const template = await this.crudService.findById(id);
        const sampleData = this.dataService.getSampleData(template.documentType);
        const html = await this.rendererService.renderToHtml(id, '', sampleData);
        return api_response_1.ApiResponse.success({ html }, 'Preview rendered');
    }
};
exports.VendorDocumentTemplateController = VendorDocumentTemplateController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all system templates' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [document_template_dto_1.TemplateQueryDto]),
    __metadata("design:returntype", Promise)
], VendorDocumentTemplateController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get template detail with HTML' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorDocumentTemplateController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new system template' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [document_template_dto_1.CreateDocumentTemplateDto]),
    __metadata("design:returntype", Promise)
], VendorDocumentTemplateController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an existing template' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, document_template_dto_1.UpdateDocumentTemplateDto]),
    __metadata("design:returntype", Promise)
], VendorDocumentTemplateController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Archive a template (soft delete)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorDocumentTemplateController.prototype, "archive", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    (0, swagger_1.ApiOperation)({ summary: 'Clone/duplicate a template' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorDocumentTemplateController.prototype, "duplicate", null);
__decorate([
    (0, common_1.Get)(':id/preview'),
    (0, swagger_1.ApiOperation)({ summary: 'Preview template with sample data' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorDocumentTemplateController.prototype, "preview", null);
exports.VendorDocumentTemplateController = VendorDocumentTemplateController = __decorate([
    (0, swagger_1.ApiTags)('Vendor Document Templates'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, vendor_guard_1.VendorGuard),
    (0, common_1.Controller)('vendor/document-templates'),
    __metadata("design:paramtypes", [template_crud_service_1.TemplateCrudService,
        template_renderer_service_1.TemplateRendererService,
        document_data_service_1.DocumentDataService])
], VendorDocumentTemplateController);
//# sourceMappingURL=vendor-document-template.controller.js.map