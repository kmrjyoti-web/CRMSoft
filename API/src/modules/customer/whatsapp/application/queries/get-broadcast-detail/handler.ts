import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetBroadcastDetailQuery } from './query';

@QueryHandler(GetBroadcastDetailQuery)
export class GetBroadcastDetailHandler implements IQueryHandler<GetBroadcastDetailQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetBroadcastDetailQuery) {
    return this.prisma.working.waBroadcast.findUniqueOrThrow({
      where: { id: query.broadcastId },
      include: { template: true },
    });
  }
}
