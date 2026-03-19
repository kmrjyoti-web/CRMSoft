import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetFieldDefinitionsQuery } from './get-field-definitions.query';

@QueryHandler(GetFieldDefinitionsQuery)
export class GetFieldDefinitionsHandler
  implements IQueryHandler<GetFieldDefinitionsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetFieldDefinitionsQuery) {
    const where: any = { entityType: query.entityType.toUpperCase() };
    if (query.activeOnly !== false) where.isActive = true;
    return this.prisma.customFieldDefinition.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }
}
