// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ListTargetsQuery } from './list-targets.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(ListTargetsQuery)
export class ListTargetsHandler implements IQueryHandler<ListTargetsQuery> {
    private readonly logger = new Logger(ListTargetsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListTargetsQuery) {
    try {
      const where: any = { isDeleted: false };
      if (query.userId) where.userId = query.userId;
      if (query.period) where.period = query.period as any;
      if (query.metric) where.metric = query.metric as any;
      if (query.isActive !== undefined) where.isActive = query.isActive;

      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 20;

      const [data, total] = await Promise.all([
        this.prisma.working.salesTarget.findMany({
          where,
          orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.working.salesTarget.count({ where }),
      ]);

      return { data, total, page, limit };
    } catch (error) {
      this.logger.error(`ListTargetsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
