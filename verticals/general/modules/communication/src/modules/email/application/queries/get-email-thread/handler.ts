import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetEmailThreadQuery } from './query';

@QueryHandler(GetEmailThreadQuery)
export class GetEmailThreadHandler implements IQueryHandler<GetEmailThreadQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetEmailThreadQuery) {
    const thread = await this.prisma.working.emailThread.findUnique({
      where: { id: query.threadId },
      include: {
        emails: {
          orderBy: { sentAt: 'asc' },
          include: {
            account: { select: { id: true, emailAddress: true } },
            attachments: { select: { id: true, fileName: true, fileSize: true } },
          },
        },
      },
    });

    if (!thread) {
      throw new NotFoundException(`Email thread ${query.threadId} not found`);
    }

    return thread;
  }
}
