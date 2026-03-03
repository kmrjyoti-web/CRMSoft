import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetTemplateDetailQuery } from './query';

@QueryHandler(GetTemplateDetailQuery)
export class GetTemplateDetailHandler implements IQueryHandler<GetTemplateDetailQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTemplateDetailQuery) {
    return this.prisma.waTemplate.findUniqueOrThrow({
      where: { id: query.templateId },
    });
  }
}
