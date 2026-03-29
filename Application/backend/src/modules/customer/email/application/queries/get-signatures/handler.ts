import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetSignaturesQuery } from './query';

@QueryHandler(GetSignaturesQuery)
export class GetSignaturesHandler implements IQueryHandler<GetSignaturesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetSignaturesQuery) {
    return this.prisma.working.emailSignature.findMany({
      where: { userId: query.userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
