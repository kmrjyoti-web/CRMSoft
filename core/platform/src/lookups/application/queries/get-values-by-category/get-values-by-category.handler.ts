import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger, Optional, Inject } from '@nestjs/common';
import { PLATFORM_PRISMA, IPlatformPrisma } from '../../../../shared/prisma.token';
import { GetValuesByCategoryQuery } from './get-values-by-category.query';

/**
 * Most-used query: Get all values for a category.
 * Used by frontend dropdowns: GET /lookups/values/INDUSTRY
 */
@QueryHandler(GetValuesByCategoryQuery)
export class GetValuesByCategoryHandler implements IQueryHandler<GetValuesByCategoryQuery> {
  private readonly logger = new Logger(GetValuesByCategoryHandler.name);

  constructor(
    @Optional() @Inject(PLATFORM_PRISMA) private readonly prisma?: IPlatformPrisma,
  ) {}

  async execute(query: GetValuesByCategoryQuery) {
    try {
      const category = query.category.toUpperCase();
      const lookup = await this.prisma!.platform.masterLookup.findFirst({
        where: { category },
      });
      if (!lookup) throw new NotFoundException(`Lookup category "${category}" not found`);

      const where: any = { lookupId: lookup.id };
      if (query.activeOnly !== false) where.isActive = true;

      const values = await this.prisma!.platform.lookupValue.findMany({
        where,
        orderBy: { rowIndex: 'asc' },
        select: {
          id: true, value: true, label: true, icon: true,
          color: true, isDefault: true, rowIndex: true,
          parentId: true, configJson: true,
        },
      });

      return { lookupId: lookup.id, category: lookup.category, displayName: lookup.displayName, values };
    } catch (error) {
      this.logger.error(`GetValuesByCategoryHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
