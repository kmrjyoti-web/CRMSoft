import { PrismaService } from '../../../../core/prisma/prisma.service';
import { CanvasRendererService } from './canvas-renderer.service';
export declare class TemplateRendererService {
    private readonly prisma;
    private readonly canvasRendererService;
    private readonly logger;
    private handlebarsInstance;
    constructor(prisma: PrismaService, canvasRendererService: CanvasRendererService);
    renderTemplate(templateId: string, tenantId: string, data: Record<string, any>): Promise<string>;
    renderToHtml(templateId: string, tenantId: string, data: Record<string, any>): Promise<string>;
    renderToPdf(templateId: string, tenantId: string, data: Record<string, any>): Promise<Buffer>;
    private registerHelpers;
    private deepMerge;
    private numberToWordsINR;
}
