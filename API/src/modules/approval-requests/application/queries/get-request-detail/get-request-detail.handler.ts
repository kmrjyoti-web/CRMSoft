import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetRequestDetailQuery } from './get-request-detail.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@QueryHandler(GetRequestDetailQuery)
export class GetRequestDetailHandler implements IQueryHandler<GetRequestDetailQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetRequestDetailQuery) {
    const request = await this.prisma.approvalRequest.findUnique({
      where: { id: query.requestId },
      include: {
        maker: { select: { id: true, firstName: true, lastName: true, email: true } },
        checker: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!request) throw new NotFoundException('Approval request not found');
    return request;
  }
}
