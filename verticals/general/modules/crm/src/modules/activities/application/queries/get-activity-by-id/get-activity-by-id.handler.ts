// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { GetActivityByIdQuery } from './get-activity-by-id.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetActivityByIdQuery)
export class GetActivityByIdHandler implements IQueryHandler<GetActivityByIdQuery> {
    private readonly logger = new Logger(GetActivityByIdHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetActivityByIdQuery) {
    try {
      const activity = await this.prisma.working.activity.findUnique({
        where: { id: query.id },
        include: {
          lead: { select: { id: true, leadNumber: true, status: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
          createdByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });
      if (!activity) throw new NotFoundException('Activity not found');
      return activity;
    } catch (error) {
      this.logger.error(`GetActivityByIdHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
