// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { GetTourPlanByIdQuery } from './get-tour-plan-by-id.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetTourPlanByIdQuery)
export class GetTourPlanByIdHandler implements IQueryHandler<GetTourPlanByIdQuery> {
    private readonly logger = new Logger(GetTourPlanByIdHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTourPlanByIdQuery) {
    try {
      const tourPlan = await this.prisma.working.tourPlan.findUnique({
        where: { id: query.id },
        include: {
          lead: { select: { id: true, leadNumber: true, status: true } },
          salesPerson: { select: { id: true, firstName: true, lastName: true, email: true } },
          visits: {
            orderBy: { sortOrder: 'asc' },
            include: {
              lead: { select: { id: true, leadNumber: true } },
              contact: { select: { id: true, firstName: true, lastName: true } },
              photos: true,
            },
          },
        },
      });
      if (!tourPlan) throw new NotFoundException('Tour plan not found');
      return tourPlan;
    } catch (error) {
      this.logger.error(`GetTourPlanByIdHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
