import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetPlanByIdQuery } from './query';

@QueryHandler(GetPlanByIdQuery)
export class GetPlanByIdHandler implements IQueryHandler<GetPlanByIdQuery> {
  private readonly logger = new Logger(GetPlanByIdHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetPlanByIdQuery) {
    this.logger.log(`Fetching plan by id: ${query.planId}`);

    const plan = await this.prisma.plan.findUnique({
      where: { id: query.planId },
    });

    if (!plan) {
      throw new NotFoundException(`Plan ${query.planId} not found`);
    }

    return plan;
  }
}
