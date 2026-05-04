import { Module } from '@nestjs/common';
import { DocumentTemplateController } from './presentation/document-template.controller';
import { DocumentRenderController } from './presentation/document-render.controller';
import { VendorDocumentTemplateController } from './presentation/vendor-document-template.controller';
import { FormulaController } from './presentation/formula.controller';
import { ReportAiController } from './presentation/report-ai.controller';
import { TemplateCrudService } from './services/template-crud.service';
import { TemplateCustomizationService } from './services/template-customization.service';
import { TemplateRendererService } from './services/template-renderer.service';
import { DocumentDataService } from './services/document-data.service';
import { FormulaService } from './services/formula.service';
import { CanvasRendererService } from './services/canvas-renderer.service';
import { AiReportDesignerService } from './services/ai-report-designer.service';

@Module({
  controllers: [
    DocumentTemplateController,
    DocumentRenderController,
    VendorDocumentTemplateController,
    FormulaController,
    ReportAiController,
  ],
  providers: [
    TemplateCrudService,
    TemplateCustomizationService,
    TemplateRendererService,
    DocumentDataService,
    FormulaService,
    CanvasRendererService,
    AiReportDesignerService,
  ],
  exports: [
    TemplateRendererService,
    DocumentDataService,
    FormulaService,
    CanvasRendererService,
  ],
})
export class DocumentTemplatesModule {}
