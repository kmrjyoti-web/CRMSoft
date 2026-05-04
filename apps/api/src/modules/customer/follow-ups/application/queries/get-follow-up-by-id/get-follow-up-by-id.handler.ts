// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { GetFollowUpByIdQuery } from './get-follow-up-by-id.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetFollowUpByIdQuery)
export class GetFollowUpByIdHandler implements IQueryHandler<GetFollowUpByIdQuery> {
    private readonly logger = new Logger(GetFollowUpByIdHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetFollowUpByIdQuery) {
    try {
      const followUp = await this.prisma.working.followUp.findUnique({
        where: { id: query.id },
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });
      if (!followUp) throw new NotFoundException('Follow-up not found');
      return followUp;
    } catch (error) {
      this.logger.error(`GetFollowUpByIdHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
