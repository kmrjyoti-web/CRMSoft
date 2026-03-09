import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetProductByIdQuery } from './get-product-by-id.query';

@QueryHandler(GetProductByIdQuery)
export class GetProductByIdHandler implements IQueryHandler<GetProductByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetProductByIdQuery) {
    const product = await this.prisma.product.findUnique({
      where: { id: query.id },
      include: {
        parent: { select: { id: true, name: true, code: true } },
        brand: { select: { id: true, name: true, code: true } },
        manufacturer: { select: { id: true, name: true, code: true } },
        children: {
          select: {
            id: true, name: true, code: true,
            salePrice: true, image: true, status: true,
          },
        },
        prices: true,
        taxDetails: true,
        unitConversions: true,
        filters: {
          include: {
            lookupValue: {
              select: {
                id: true, value: true, label: true,
                lookup: { select: { id: true, category: true, displayName: true } },
              },
            },
          },
        },
        relatedFrom: {
          include: {
            toProduct: {
              select: {
                id: true, name: true, code: true,
                salePrice: true, image: true, status: true,
              },
            },
          },
        },
        relatedTo: {
          include: {
            fromProduct: {
              select: {
                id: true, name: true, code: true,
                salePrice: true, image: true, status: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product "${query.id}" not found`);
    }

    return product;
  }
}
