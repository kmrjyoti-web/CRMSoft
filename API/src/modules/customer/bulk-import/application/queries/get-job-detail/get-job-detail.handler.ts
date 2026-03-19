import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetJobDetailQuery } from './get-job-detail.query';

@QueryHandler(GetJobDetailQuery)
export class GetJobDetailHandler implements IQueryHandler<GetJobDetailQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetJobDetailQuery) {
    return this.prisma.working.importJob.findUniqueOrThrow({
      where: { id: query.jobId },
      include: { profile: { select: { id: true, name: true, sourceSystem: true, icon: true } } },
    });
  }
}
