// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetTourPlanByIdQuery } from './get-tour-plan-by-id.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetTourPlanByIdQuery)
export class GetTourPlanByIdHandler implements IQueryHandler<GetTourPlanByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTourPlanByIdQuery) {
    const tourPlan = await this.prisma.tourPlan.findUnique({
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
  }
}
