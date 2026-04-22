// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetActivitiesByEntityQuery } from './get-activities-by-entity.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetActivitiesByEntityQuery)
export class GetActivitiesByEntityHandler implements IQueryHandler<GetActivitiesByEntityQuery> {
    private readonly logger = new Logger(GetActivitiesByEntityHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetActivitiesByEntityQuery) {
    try {
      const where: any = {};
      if (query.entityType === 'LEAD') where.leadId = query.entityId;
      else if (query.entityType === 'CONTACT') where.contactId = query.entityId;

      const [data, total] = await Promise.all([
        this.prisma.working.activity.findMany({
          where,
          include: {
            createdByUser: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
        }),
        this.prisma.working.activity.count({ where }),
      ]);

      return { data, total, page: query.page, limit: query.limit };
    } catch (error) {
      this.logger.error(`GetActivitiesByEntityHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
