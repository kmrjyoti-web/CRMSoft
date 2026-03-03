import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetJobRowsQuery } from './get-job-rows.query';

@QueryHandler(GetJobRowsQuery)
export class GetJobRowsHandler implements IQueryHandler<GetJobRowsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetJobRowsQuery) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const where: any = { importJobId: query.jobId };

    if (query.status) where.rowStatus = query.status;

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
