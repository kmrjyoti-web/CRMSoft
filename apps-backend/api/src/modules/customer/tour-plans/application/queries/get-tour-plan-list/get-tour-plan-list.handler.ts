// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetTourPlanListQuery } from './get-tour-plan-list.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetTourPlanListQuery)
export class GetTourPlanListHandler implements IQueryHandler<GetTourPlanListQuery> {
    private readonly logger = new Logger(GetTourPlanListHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTourPlanListQuery) {
    try {
      const where: any = {};
      if (query.status) where.status = query.status;
      if (query.salesPersonId) where.salesPersonId = query.salesPersonId;
      if (query.search) {
        where.OR = [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ];
      }
      if (query.fromDate || query.toDate) {
        where.planDate = {};
        if (query.fromDate) where.planDate.gte = new Date(query.fromDate);
        if (query.toDate) where.planDate.lte = new Date(query.toDate);
      }

      const [data, total] = await Promise.all([
        this.prisma.working.tourPlan.findMany({
          where,
          include: {
            lead: { select: { id: true, leadNumber: true } },
            salesPerson: { select: { id: true, firstName: true, lastName: true } },
            visits: { orderBy: { sortOrder: 'asc' } },
          },
          orderBy: { [query.sortBy]: query.sortOrder },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
        }),
        this.prisma.working.tourPlan.count({ where }),
      ]);

      return { data, total, page: query.page, limit: query.limit };
    } catch (error) {
      this.logger.error(`GetTourPlanListHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
