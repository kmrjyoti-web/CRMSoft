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
exports.DocumentRenderController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const template_renderer_service_1 = require("../services/template-renderer.service");
const document_data_service_1 = require("../services/document-data.service");
const document_template_dto_1 = require("./dto/document-template.dto");
let DocumentRenderController = class DocumentRenderController {
    constructor(rendererService, dataService) {
        this.rendererService = rendererService;
        this.dataService = dataService;
    }
    async preview(user, dto) {
        const data = await this.getDataForType(dto.documentType, dto.documentId, user.tenantId);
        const html = await this.rendererService.renderToHtml(dto.templateId, user.tenantId, data);
        return api_response_1.ApiResponse.success({ html }, 'Preview rendered');
    }
    async generatePdf(user, dto, res) {
        const data = await this.getDataForType(dto.documentType, dto.documentId, user.tenantId);
        const buffer = await this.rendererService.renderToPdf(dto.templateId, user.tenantId, data);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${dto.documentType}-${dto.documentId}.pdf"`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
    async bulkPdf(user, dto, res) {
        const buffers = [];
        for (const docId of dto.documentIds) {
            const data = await this.getDataForType(dto.documentType, docId, user.tenantId);
            const buf = await this.rendererService.renderToPdf(dto.templateId, user.tenantId, data);
            buffers.push(buf);
        }
        const buffer = buffers[0] ?? Buffer.alloc(0);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${dto.documentType}-bulk.pdf"`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
    async getDocumentData(user, type, id) {
        const data = await this.getDataForType(type, id, user.tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async getSampleData(type) {
        const data = this.dataService.getSampleData(type);
        return api_response_1.ApiResponse.success(data);
    }
    async getDataForType(type, id, tenantId) {
        if (id === 'sample' || id === 'preview') {
            return this.dataService.getSampleData(type);
        }
        switch (type.toUpperCase()) {
            case 'GST_INVOICE':
            case 'PROFORMA_INVOICE':
            case 'RECEIPT':
            case 'CREDIT_NOTE':
            case 'DEBIT_NOTE':
                return this.dataService.getInvoiceData(id, tenantId);
            case 'QUOTATION':
                return this.dataService.getQuotationData(id, tenantId);
            default:
                return this.dataService.getSampleData(type);
        }
    }
};
exports.DocumentRenderController = DocumentRenderController;
__decorate([
    (0, common_1.Post)('preview'),
    (0, swagger_1.ApiOperation)({ summary: 'Render document to HTML preview' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, document_template_dto_1.RenderDocumentDto]),
    __metadata("design:returntype", Promise)
], DocumentRenderController.prototype, "preview", null);
__decorate([
    (0, common_1.Post)('pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Render document to PDF' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, document_template_dto_1.RenderDocumentDto, Object]),
    __metadata("design:returntype", Promise)
], DocumentRenderController.prototype, "generatePdf", null);
__decorate([
    (0, common_1.Post)('pdf/bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk PDF generation' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, document_template_dto_1.BulkRenderDto, Object]),
    __metadata("design:returntype", Promise)
], DocumentRenderController.prototype, "bulkPdf", null);
__decorate([
    (0, common_1.Get)('data/:type/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get document data for rendering' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('type')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], DocumentRenderController.prototype, "getDocumentData", null);
__decorate([
    (0, common_1.Get)('sample-data/:type'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sample data for template preview' }),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentRenderController.prototype, "getSampleData", null);
exports.DocumentRenderController = DocumentRenderController = __decorate([
    (0, swagger_1.ApiTags)('Document Rendering'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('documents'),
    __metadata("design:paramtypes", [template_renderer_service_1.TemplateRendererService,
        document_data_service_1.DocumentDataService])
], DocumentRenderController);
//# sourceMappingURL=document-render.controller.js.map