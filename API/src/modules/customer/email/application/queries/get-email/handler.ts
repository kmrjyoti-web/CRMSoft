import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetEmailQuery } from './query';

@QueryHandler(GetEmailQuery)
export class GetEmailHandler implements IQueryHandler<GetEmailQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetEmailQuery) {
    const email = await this.prisma.working.email.findUnique({
      where: { id: query.emailId },
      include: {
        account: true,
        thread: true,
        attachments: true,
        trackingEvents: true,
      },
    });

    if (!email) {
      throw new NotFoundException(`Email ${query.emailId} not found`);
    }

    return email;
  }
}
