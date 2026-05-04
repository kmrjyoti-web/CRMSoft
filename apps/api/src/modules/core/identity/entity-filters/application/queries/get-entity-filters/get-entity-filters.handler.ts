import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { GetEntityFiltersQuery } from './get-entity-filters.query';
import { ENTITY_FILTER_CONFIG } from '../../../entity-filter.types';

/**
 * Returns all filters for an entity, grouped by MasterLookup category.
 *
 * Response shape:
 * {
 *   "LEAD_TYPE": [{ id, value: "HOT", label: "Hot Lead", color: "#EF4444" }],
 *   "LEAD_SOURCE": [{ id, value: "WEBSITE", label: "Website" }]
 * }
 */
@QueryHandler(GetEntityFiltersQuery)
export class GetEntityFiltersHandler implements IQueryHandler<GetEntityFiltersQuery> {
    private readonly logger = new Logger(GetEntityFiltersHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetEntityFiltersQuery) {
    try {
      const config = ENTITY_FILTER_CONFIG[query.entityType];

      const filters = await (this.prisma[config.filterModel] as any).findMany({
        where: { [config.fkField]: query.entityId },
        include: {
          lookupValue: {
            select: {
              id: true, value: true, label: true, icon: true, color: true,
              lookup: { select: { category: true, displayName: true } },
            },
          },
        },
      });

      // Group by category
      const grouped: Record<string, { category: string; displayName: string; values: Record<string, unknown>[] }> = {};
      for (const f of filters) {
        const cat = f.lookupValue.lookup.category;
        if (!grouped[cat]) {
          grouped[cat] = {
            category: cat,
            displayName: f.lookupValue.lookup.displayName,
            values: [],
          };
        }
        grouped[cat].values.push({
          id: f.lookupValue.id,
          value: f.lookupValue.value,
          label: f.lookupValue.label,
          icon: f.lookupValue.icon,
          color: f.lookupValue.color,
        });
      }

      // Also return flat list for convenience
      const flat = filters.map((f: any) => ({
        id: f.lookupValue.id,
        value: f.lookupValue.value,
        label: f.lookupValue.label,
        category: f.lookupValue.lookup.category,
      }));

      return { grouped, flat, count: flat.length };
    } catch (error) {
      this.logger.error(`GetEntityFiltersHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
