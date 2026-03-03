import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetProductTreeQuery } from './get-product-tree.query';

@QueryHandler(GetProductTreeQuery)
export class GetProductTreeHandler implements IQueryHandler<GetProductTreeQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(_query: GetProductTreeQuery) {
    return this.prisma.product.findMany({
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
  }
}
