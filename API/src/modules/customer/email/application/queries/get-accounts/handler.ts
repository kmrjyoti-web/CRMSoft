import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetAccountsQuery } from './query';

@QueryHandler(GetAccountsQuery)
export class GetAccountsHandler implements IQueryHandler<GetAccountsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetAccountsQuery) {
    return this.prisma.emailAccount.findMany({
      where: { userId: query.userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
