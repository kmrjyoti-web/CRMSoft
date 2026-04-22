import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetTemplatesQuery } from './get-templates.query';
import { NotificationTemplateService } from '../../../services/template.service';

@QueryHandler(GetTemplatesQuery)
export class GetTemplatesHandler implements IQueryHandler<GetTemplatesQuery> {
    private readonly logger = new Logger(GetTemplatesHandler.name);

  constructor(private readonly templateService: NotificationTemplateService) {}

  async execute(query: GetTemplatesQuery) {
    try {
      return this.templateService.getAll({
        category: query.category,
        isActive: query.isActive,
      });
    } catch (error) {
      this.logger.error(`GetTemplatesHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
