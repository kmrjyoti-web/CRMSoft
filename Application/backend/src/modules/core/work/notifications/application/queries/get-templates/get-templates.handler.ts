import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetTemplatesQuery } from './get-templates.query';
import { NotificationTemplateService } from '../../../services/template.service';

@QueryHandler(GetTemplatesQuery)
export class GetTemplatesHandler implements IQueryHandler<GetTemplatesQuery> {
  constructor(private readonly templateService: NotificationTemplateService) {}

  async execute(query: GetTemplatesQuery) {
    return this.templateService.getAll({
      category: query.category,
      isActive: query.isActive,
    });
  }
}
