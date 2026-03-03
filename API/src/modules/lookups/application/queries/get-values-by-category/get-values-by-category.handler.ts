import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetValuesByCategoryQuery } from './get-values-by-category.query';

/**
 * Most-used query: Get all values for a category.
 * Used by frontend dropdowns: GET /lookups/values/INDUSTRY
 */
@QueryHandler(GetValuesByCategoryQuery)
export class GetValuesByCategoryHandler implements IQueryHandler<GetValuesByCategoryQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetValuesByCategoryQuery) {
    const category = query.category.toUpperCase();
    const lookup = await this.prisma.masterLookup.findFirst({
      where: { category },
    });
    if (!lookup) throw new NotFoundException(`Lookup category "${category}" not found`);

    const where: any = { lookupId: lookup.id };
    if (query.activeOnly !== false) where.isActive = true;

    const values = await this.prisma.lookupValue.findMany({
      where,
      orderBy: { rowIndex: 'asc' },
      select: {
        id: true, value: true, label: true, icon: true,
        color: true, isDefault: true, rowIndex: true,
        parentId: true, configJson: true,
      },
    });

    return { lookupId: lookup.id, category: lookup.category, displayName: lookup.displayName, values };
  }
}
