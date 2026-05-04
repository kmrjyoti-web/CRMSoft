import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetDuplicatesQuery } from './get-duplicates.query';

@QueryHandler(GetDuplicatesQuery)
export class GetDuplicatesHandler implements IQueryHandler<GetDuplicatesQuery> {
    private readonly logger = new Logger(GetDuplicatesHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetDuplicatesQuery) {
    try {
      const page = query.page || 1;
      const limit = query.limit || 50;
      const where = {
        importJobId: query.jobId,
        isDuplicate: true,
      };

      const [data, total] = await Promise.all([
        this.prisma.working.importRow.findMany({
          where, skip: (page - 1) * limit, take: limit,
          orderBy: { rowNumber: 'asc' },
        }),
        this.prisma.working.importRow.count({ where }),
      ]);

      return { data, total, page, limit };
    } catch (error) {
      this.logger.error(`GetDuplicatesHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
