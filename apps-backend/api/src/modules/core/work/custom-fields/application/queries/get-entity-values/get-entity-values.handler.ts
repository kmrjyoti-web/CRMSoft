import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { GetEntityValuesQuery } from './get-entity-values.query';

@QueryHandler(GetEntityValuesQuery)
export class GetEntityValuesHandler
  implements IQueryHandler<GetEntityValuesQuery>
{
    private readonly logger = new Logger(GetEntityValuesHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetEntityValuesQuery) {
    try {
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
    } catch (error) {
      this.logger.error(`GetEntityValuesHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
