import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetRowDetailQuery } from './get-row-detail.query';

@QueryHandler(GetRowDetailQuery)
export class GetRowDetailHandler implements IQueryHandler<GetRowDetailQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetRowDetailQuery) {
    return this.prisma.importRow.findUniqueOrThrow({
      where: { id: query.rowId },
    });
  }
}
