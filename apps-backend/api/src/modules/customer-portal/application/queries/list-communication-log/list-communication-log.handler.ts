import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ListCommunicationLogQuery } from './list-communication-log.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@QueryHandler(ListCommunicationLogQuery)
export class ListCommunicationLogHandler implements IQueryHandler<ListCommunicationLogQuery> {
  private readonly logger = new Logger(ListCommunicationLogHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListCommunicationLogQuery) {
    const { tenantId, entityType, entityId, channel, status, limit, offset } = query;

    const workingClient = await this.prisma.getWorkingClient(tenantId);

    const where: Record<string, unknown> = {
      tenantId,
      entityType,
      entityId,
      isDeleted: false,
    };
    if (channel) where.channel = channel;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      (workingClient as any).communicationLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          channel: true,
          direction: true,
          recipientAddr: true,
          subject: true,
          body: true,
          status: true,
          externalId: true,
          errorMessage: true,
          sentAt: true,
          deliveredAt: true,
          costAmount: true,
          costCurrency: true,
          createdAt: true,
        },
      }),
      (workingClient as any).communicationLog.count({ where }),
    ]);

    return { items, total, limit, offset };
  }
}
