import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetWabaDetailQuery } from './query';

@QueryHandler(GetWabaDetailQuery)
export class GetWabaDetailHandler implements IQueryHandler<GetWabaDetailQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetWabaDetailQuery) {
    return this.prisma.whatsAppBusinessAccount.findUniqueOrThrow({
      where: { id: query.wabaId },
    });
  }
}
