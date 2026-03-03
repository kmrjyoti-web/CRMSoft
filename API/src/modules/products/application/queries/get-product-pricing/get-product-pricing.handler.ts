import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetProductPricingQuery } from './get-product-pricing.query';

@QueryHandler(GetProductPricingQuery)
export class GetProductPricingHandler
  implements IQueryHandler<GetProductPricingQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetProductPricingQuery) {
    const product = await this.prisma.product.findUnique({
      where: { id: query.productId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException(`Product "${query.productId}" not found`);
    }

    const prices = await this.prisma.productPrice.findMany({
      where: { productId: query.productId, isActive: true },
      include: {
        priceGroup: { select: { id: true, name: true, code: true } },
      },
      orderBy: [{ priceType: 'asc' }, { amount: 'asc' }],
    });

    // Group by priceType
    const grouped: Record<string, typeof prices> = {};
    for (const price of prices) {
      const key = price.priceType;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(price);
    }

    return { productId: query.productId, prices, grouped };
  }
}
