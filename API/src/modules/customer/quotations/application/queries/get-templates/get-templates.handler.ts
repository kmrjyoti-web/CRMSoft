import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetTemplatesQuery } from './get-templates.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetTemplatesQuery)
export class GetTemplatesHandler implements IQueryHandler<GetTemplatesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTemplatesQuery) {
    const where: any = { isActive: true };
    if (query.industry) where.industry = query.industry;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.working.quotationTemplate.findMany({
      where,
      orderBy: { usageCount: 'desc' },
    });
  }
}
