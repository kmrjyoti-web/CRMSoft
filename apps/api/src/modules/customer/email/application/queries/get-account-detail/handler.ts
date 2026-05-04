import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetAccountDetailQuery } from './query';

@QueryHandler(GetAccountDetailQuery)
export class GetAccountDetailHandler implements IQueryHandler<GetAccountDetailQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetAccountDetailQuery) {
    const account = await this.prisma.working.emailAccount.findUnique({
      where: { id: query.accountId },
    });

    if (!account) {
      throw new NotFoundException(`Email account ${query.accountId} not found`);
    }

    return account;
  }
}
