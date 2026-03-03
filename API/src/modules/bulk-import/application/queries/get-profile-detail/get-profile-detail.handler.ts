import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetProfileDetailQuery } from './get-profile-detail.query';

@QueryHandler(GetProfileDetailQuery)
export class GetProfileDetailHandler implements IQueryHandler<GetProfileDetailQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetProfileDetailQuery) {
    return this.prisma.importProfile.findUniqueOrThrow({
      where: { id: query.profileId },
      include: { importJobs: { take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, fileName: true, status: true, totalRows: true, importedCount: true, createdAt: true } } },
    });
  }
}
