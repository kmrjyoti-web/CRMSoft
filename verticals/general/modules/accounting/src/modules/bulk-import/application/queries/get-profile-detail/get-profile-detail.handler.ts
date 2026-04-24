import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetProfileDetailQuery } from './get-profile-detail.query';

@QueryHandler(GetProfileDetailQuery)
export class GetProfileDetailHandler implements IQueryHandler<GetProfileDetailQuery> {
    private readonly logger = new Logger(GetProfileDetailHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetProfileDetailQuery) {
    try {
      return this.prisma.working.importProfile.findUniqueOrThrow({
        where: { id: query.profileId },
        include: { importJobs: { take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, fileName: true, status: true, totalRows: true, importedCount: true, createdAt: true } } },
      });
    } catch (error) {
      this.logger.error(`GetProfileDetailHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
