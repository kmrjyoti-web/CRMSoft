import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetEntitiesByFilterQuery } from './get-entities-by-filter.query';
import { ENTITY_FILTER_CONFIG } from '../../../entity-filter.types';

@QueryHandler(GetEntitiesByFilterQuery)
export class GetEntitiesByFilterHandler implements IQueryHandler<GetEntitiesByFilterQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetEntitiesByFilterQuery) {
    const config = ENTITY_FILTER_CONFIG[query.entityType];

    if (query.matchAll) {
      // AND logic: entity must have ALL specified filters
      // Get entity IDs that have each filter value
      const results = await (this.prisma[config.filterModel] as any).groupBy({
        by: [config.fkField],
        where: { lookupValueId: { in: query.lookupValueIds } },
        _count: { lookupValueId: true },
        having: { lookupValueId: { _count: { gte: query.lookupValueIds.length } } },
      });
      return results.map((r: any) => r[config.fkField]);
    } else {
      // OR logic: entity has ANY of the specified filters
      const results = await (this.prisma[config.filterModel] as any).findMany({
        where: { lookupValueId: { in: query.lookupValueIds } },
        select: { [config.fkField]: true },
        distinct: [config.fkField],
      });
      return results.map((r: any) => r[config.fkField]);
    }
  }
}
