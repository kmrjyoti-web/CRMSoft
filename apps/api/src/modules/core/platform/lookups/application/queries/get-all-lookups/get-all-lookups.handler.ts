import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { GetAllLookupsQuery } from './get-all-lookups.query';

@QueryHandler(GetAllLookupsQuery)
export class GetAllLookupsHandler implements IQueryHandler<GetAllLookupsQuery> {
    private readonly logger = new Logger(GetAllLookupsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetAllLookupsQuery) {
    try {
      const where: any = {};
      if (query.activeOnly !== false) where.isActive = true;

      return this.prisma.platform.masterLookup.findMany({
        where,
        orderBy: { category: 'asc' },
        include: {
          _count: { select: { values: true } },
        },
      });
    } catch (error) {
      this.logger.error(`GetAllLookupsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
