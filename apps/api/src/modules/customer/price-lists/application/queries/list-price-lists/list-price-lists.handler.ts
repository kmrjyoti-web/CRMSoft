// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ListPriceListsQuery } from './list-price-lists.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(ListPriceListsQuery)
export class ListPriceListsHandler implements IQueryHandler<ListPriceListsQuery> {
    private readonly logger = new Logger(ListPriceListsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(q: ListPriceListsQuery) {
    try {
      const where: any = { isDeleted: false };
      if (q.search) where.name = { contains: q.search, mode: 'insensitive' };
      if (q.isActive !== undefined) where.isActive = q.isActive;

      const page = Math.max(1, +q.page || 1);
      const limit = Math.min(100, +q.limit || 20);

      const [data, total] = await Promise.all([
        this.prisma.working.priceList.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { priority: 'asc' },
          include: { _count: { select: { items: true } } },
        }),
        this.prisma.working.priceList.count({ where }),
      ]);

      return { data, total, page, limit };
    } catch (error) {
      this.logger.error(`ListPriceListsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
