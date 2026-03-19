import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetMyRequestsQuery } from './get-my-requests.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetMyRequestsQuery)
export class GetMyRequestsHandler implements IQueryHandler<GetMyRequestsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyRequestsQuery) {
    return this.prisma.approvalRequest.findMany({
      where: { makerId: query.makerId },
      include: {
        checker: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
