// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { GetRequestDetailQuery } from './get-request-detail.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetRequestDetailQuery)
export class GetRequestDetailHandler implements IQueryHandler<GetRequestDetailQuery> {
    private readonly logger = new Logger(GetRequestDetailHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetRequestDetailQuery) {
    try {
      const request = await this.prisma.working.approvalRequest.findUnique({
        where: { id: query.requestId },
        include: {
          maker: { select: { id: true, firstName: true, lastName: true, email: true } },
          checker: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });
      if (!request) throw new NotFoundException('Approval request not found');
      return request;
    } catch (error) {
      this.logger.error(`GetRequestDetailHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
