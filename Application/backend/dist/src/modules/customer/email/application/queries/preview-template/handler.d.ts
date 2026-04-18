import { IQueryHandler } from '@nestjs/cqrs';
import { TemplateRendererService } from '../../../services/template-renderer.service';
import { PreviewTemplateQuery } from './query';
export declare class PreviewTemplateHandler implements IQueryHandler<PreviewTemplateQuery> {
    private readonly templateRenderer;
    constructor(templateRenderer: TemplateRendererService);
    execute(query: PreviewTemplateQuery): Promise<{
        subject: string;
        bodyHtml: string;
        bodyText: string | null;
        usedVariables: import("../../../services/template-renderer.service").VariableInfo[];
    }>;
}
