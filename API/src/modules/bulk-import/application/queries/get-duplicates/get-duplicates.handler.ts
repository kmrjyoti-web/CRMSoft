import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetDuplicatesQuery } from './get-duplicates.query';

@QueryHandler(GetDuplicatesQuery)
export class GetDuplicatesHandler implements IQueryHandler<GetDuplicatesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetDuplicatesQuery) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const where = {
      importJobId: query.jobId,
      isDuplicate: true,
    };

    const [data, total] = await Promise.all([
      this.prisma.importRow.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { rowNumber: 'asc' },
      }),
      this.prisma.importRow.count({ where }),
    ]);

    return { data, total, page, limit };
  }
}
