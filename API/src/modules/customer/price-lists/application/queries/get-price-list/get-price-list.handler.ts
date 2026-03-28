// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetPriceListQuery } from './get-price-list.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetPriceListQuery)
export class GetPriceListHandler implements IQueryHandler<GetPriceListQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(q: GetPriceListQuery) {
    const pl = await this.prisma.working.priceList.findFirst({
      where: { id: q.id, isDeleted: false },
      include: { items: { orderBy: { minQuantity: 'asc' } } },
    });
    if (!pl) throw new NotFoundException('PriceList not found');
    return pl;
  }
}
