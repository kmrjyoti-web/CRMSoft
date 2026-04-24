import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetJobDetailQuery } from './get-job-detail.query';

@QueryHandler(GetJobDetailQuery)
export class GetJobDetailHandler implements IQueryHandler<GetJobDetailQuery> {
    private readonly logger = new Logger(GetJobDetailHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetJobDetailQuery) {
    try {
      return this.prisma.working.importJob.findUniqueOrThrow({
        where: { id: query.jobId },
        include: { profile: { select: { id: true, name: true, sourceSystem: true, icon: true } } },
      });
    } catch (error) {
      this.logger.error(`GetJobDetailHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
