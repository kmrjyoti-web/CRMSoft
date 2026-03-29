import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetPriceListQuery } from './get-price-list.query';

@QueryHandler(GetPriceListQuery)
export class GetPriceListHandler
  implements IQueryHandler<GetPriceListQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetPriceListQuery) {
    const product = await this.prisma.working.product.findUnique({
      where: { id: query.productId },
      select: { id: true, name: true, code: true, mrp: true, salePrice: true },
    });
    if (!product) {
      throw new NotFoundException(
        `Product "${query.productId}" not found`,
      );
    }

    const prices = await this.prisma.working.productPrice.findMany({
      where: { productId: query.productId },
      include: {
        priceGroup: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: [{ priceType: 'asc' }, { minQty: 'asc' }],
    });

    const grouped: Record<string, any[]> = {};
    for (const p of prices) {
      const key = p.priceType;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(p);
    }

    return {
      product: {
        id: product.id,
        name: product.name,
        code: product.code,
        mrp: product.mrp,
        salePrice: product.salePrice,
      },
      pricesByType: grouped,
      totalPriceEntries: prices.length,
    };
  }
}
