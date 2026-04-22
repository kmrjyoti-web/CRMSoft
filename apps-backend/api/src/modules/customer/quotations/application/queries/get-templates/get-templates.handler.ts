import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetTemplatesQuery } from './get-templates.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetTemplatesQuery)
export class GetTemplatesHandler implements IQueryHandler<GetTemplatesQuery> {
    private readonly logger = new Logger(GetTemplatesHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTemplatesQuery) {
    try {
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
    } catch (error) {
      this.logger.error(`GetTemplatesHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
