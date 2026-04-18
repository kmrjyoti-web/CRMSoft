"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentTemplatesModule = void 0;
const common_1 = require("@nestjs/common");
const document_template_controller_1 = require("./presentation/document-template.controller");
const document_render_controller_1 = require("./presentation/document-render.controller");
const vendor_document_template_controller_1 = require("./presentation/vendor-document-template.controller");
const formula_controller_1 = require("./presentation/formula.controller");
const report_ai_controller_1 = require("./presentation/report-ai.controller");
const template_crud_service_1 = require("./services/template-crud.service");
const template_customization_service_1 = require("./services/template-customization.service");
const template_renderer_service_1 = require("./services/template-renderer.service");
const document_data_service_1 = require("./services/document-data.service");
const formula_service_1 = require("./services/formula.service");
const canvas_renderer_service_1 = require("./services/canvas-renderer.service");
const ai_report_designer_service_1 = require("./services/ai-report-designer.service");
let DocumentTemplatesModule = class DocumentTemplatesModule {
};
exports.DocumentTemplatesModule = DocumentTemplatesModule;
exports.DocumentTemplatesModule = DocumentTemplatesModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            document_template_controller_1.DocumentTemplateController,
            document_render_controller_1.DocumentRenderController,
            vendor_document_template_controller_1.VendorDocumentTemplateController,
            formula_controller_1.FormulaController,
            report_ai_controller_1.ReportAiController,
        ],
        providers: [
            template_crud_service_1.TemplateCrudService,
            template_customization_service_1.TemplateCustomizationService,
            template_renderer_service_1.TemplateRendererService,
            document_data_service_1.DocumentDataService,
            formula_service_1.FormulaService,
            canvas_renderer_service_1.CanvasRendererService,
            ai_report_designer_service_1.AiReportDesignerService,
        ],
        exports: [
            template_renderer_service_1.TemplateRendererService,
            document_data_service_1.DocumentDataService,
            formula_service_1.FormulaService,
            canvas_renderer_service_1.CanvasRendererService,
        ],
    })
], DocumentTemplatesModule);
//# sourceMappingURL=document-templates.module.js.map