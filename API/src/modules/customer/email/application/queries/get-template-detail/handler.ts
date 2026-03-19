import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetTemplateDetailQuery } from './query';

@QueryHandler(GetTemplateDetailQuery)
export class GetTemplateDetailHandler implements IQueryHandler<GetTemplateDetailQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTemplateDetailQuery) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { id: query.templateId },
    });

    if (!template) {
      throw new NotFoundException(`Email template ${query.templateId} not found`);
    }

    return template;
  }
}
