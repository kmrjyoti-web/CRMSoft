import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { ListProductsQuery } from './list-products.query';

@QueryHandler(ListProductsQuery)
export class ListProductsHandler implements IQueryHandler<ListProductsQuery> {
    private readonly logger = new Logger(ListProductsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListProductsQuery) {
    try {
      const {
        page, limit, sortBy, sortDir,
        search, status, parentId, isMaster,
        brandId, manufacturerId, minPrice, maxPrice,
        taxType, licenseRequired, tags,
      } = query;

      const where: any = {};

      // Text search across name, code, shortDescription
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { shortDescription: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (status) where.status = status;
      if (parentId) where.parentId = parentId;
      if (isMaster !== undefined) where.isMaster = isMaster;
      if (brandId) where.brandId = brandId;
      if (manufacturerId) where.manufacturerId = manufacturerId;
      if (taxType) where.taxType = taxType;
      if (licenseRequired !== undefined) where.licenseRequired = licenseRequired;

      // Price range filter on salePrice
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.salePrice = {};
        if (minPrice !== undefined) where.salePrice.gte = minPrice;
        if (maxPrice !== undefined) where.salePrice.lte = maxPrice;
      }

      // Tags filter (hasSome)
      if (tags) {
        const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
        if (tagArray.length > 0) {
          where.tags = { hasSome: tagArray };
        }
      }

      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.prisma.working.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortDir },
          include: {
            parent: { select: { id: true, name: true } },
            brand: { select: { id: true, name: true, code: true } },
            manufacturer: { select: { id: true, name: true, code: true } },
            _count: { select: { children: true } },
          },
        }),
        this.prisma.working.product.count({ where }),
      ]);

      return { data, total, page, limit };
    } catch (error) {
      this.logger.error(`ListProductsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
