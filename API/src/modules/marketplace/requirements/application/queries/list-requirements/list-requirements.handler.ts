import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ListRequirementsQuery } from './list-requirements.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@QueryHandler(ListRequirementsQuery)
@Injectable()
export class ListRequirementsHandler implements IQueryHandler<ListRequirementsQuery> {
  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(query: ListRequirementsQuery) {
    const { tenantId, page, limit, categoryId, authorId, search } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, any> = {
      tenantId,
      listingType: 'REQUIREMENT',
      isDeleted: false,
      status: 'ACTIVE',
    };

    if (categoryId) where.categoryId = categoryId;
    if (authorId) where.authorId = authorId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.mktPrisma.client.mktListing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.mktPrisma.client.mktListing.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
