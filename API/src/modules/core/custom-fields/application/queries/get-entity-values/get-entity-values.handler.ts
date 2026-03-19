import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetEntityValuesQuery } from './get-entity-values.query';

@QueryHandler(GetEntityValuesQuery)
export class GetEntityValuesHandler
  implements IQueryHandler<GetEntityValuesQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetEntityValuesQuery) {
    return this.prisma.entityConfigValue.findMany({
      where: {
        entityType: query.entityType.toUpperCase(),
        entityId: query.entityId,
      },
      include: {
        definition: {
          select: {
            id: true, fieldName: true, fieldLabel: true,
            fieldType: true, options: true,
          },
        },
      },
    });
  }
}
