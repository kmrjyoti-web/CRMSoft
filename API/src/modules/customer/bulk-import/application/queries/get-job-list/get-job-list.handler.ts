import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetJobListQuery } from './get-job-list.query';

@QueryHandler(GetJobListQuery)
export class GetJobListHandler implements IQueryHandler<GetJobListQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetJobListQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = {};

    if (query.userId) where.createdById = query.userId;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.working.importJob.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { profile: { select: { id: true, name: true, sourceSystem: true } } },
      }),
      this.prisma.working.importJob.count({ where }),
    ]);

    return { data, total, page, limit };
  }
}
