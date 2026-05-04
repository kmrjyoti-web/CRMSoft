import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetProductTreeQuery } from './get-product-tree.query';

@QueryHandler(GetProductTreeQuery)
export class GetProductTreeHandler implements IQueryHandler<GetProductTreeQuery> {
    private readonly logger = new Logger(GetProductTreeHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(_query: GetProductTreeQuery) {
    try {
      return this.prisma.working.product.findMany({
        where: {
          isMaster: true,
          isActive: true,
        },
        orderBy: { sortOrder: 'asc' },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              name: true,
              code: true,
              slug: true,
              salePrice: true,
              image: true,
              status: true,
              sortOrder: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`GetProductTreeHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
