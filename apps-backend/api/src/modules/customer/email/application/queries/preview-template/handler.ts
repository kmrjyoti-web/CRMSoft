import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TemplateRendererService } from '../../../services/template-renderer.service';
import { PreviewTemplateQuery } from './query';

@QueryHandler(PreviewTemplateQuery)
export class PreviewTemplateHandler implements IQueryHandler<PreviewTemplateQuery> {
  constructor(private readonly templateRenderer: TemplateRendererService) {}

  async execute(query: PreviewTemplateQuery) {
    return this.templateRenderer.preview(query.templateId, query.sampleData);
  }
}
