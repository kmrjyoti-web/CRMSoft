// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetMyRequestsQuery } from './get-my-requests.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetMyRequestsQuery)
export class GetMyRequestsHandler implements IQueryHandler<GetMyRequestsQuery> {
    private readonly logger = new Logger(GetMyRequestsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyRequestsQuery) {
    try {
      return this.prisma.working.approvalRequest.findMany({
        where: { makerId: query.makerId },
        include: {
          checker: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(`GetMyRequestsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
