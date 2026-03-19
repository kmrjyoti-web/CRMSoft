import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetProfileListQuery } from './get-profile-list.query';

@QueryHandler(GetProfileListQuery)
export class GetProfileListHandler implements IQueryHandler<GetProfileListQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetProfileListQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = {};

    if (query.targetEntity) where.targetEntity = query.targetEntity;
    if (query.status) where.status = query.status;
    else where.status = { not: 'ARCHIVED' };

    const [data, total] = await Promise.all([
      this.prisma.working.importProfile.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { usageCount: 'desc' },
      }),
      this.prisma.working.importProfile.count({ where }),
    ]);

    return { data, total, page, limit };
  }
}
