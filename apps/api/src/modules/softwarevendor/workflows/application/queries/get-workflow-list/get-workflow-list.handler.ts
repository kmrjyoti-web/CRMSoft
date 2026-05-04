import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetWorkflowListQuery } from './get-workflow-list.query';

@QueryHandler(GetWorkflowListQuery)
export class GetWorkflowListHandler implements IQueryHandler<GetWorkflowListQuery> {
    private readonly logger = new Logger(GetWorkflowListHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetWorkflowListQuery) {
    try {
      const where: any = {};
      if (query.search) {
        where.OR = [
          { name: { contains: query.search, mode: 'insensitive' } },
          { code: { contains: query.search, mode: 'insensitive' } },
        ];
      }
      if (query.entityType) where.entityType = query.entityType;

      const skip = (query.page - 1) * query.limit;
      const [data, total] = await Promise.all([
        this.prisma.workflow.findMany({
          where, skip, take: query.limit,
          orderBy: { createdAt: query.sortOrder },
          include: {
            _count: { select: { states: true, transitions: true, instances: true } },
          },
        }),
        this.prisma.workflow.count({ where }),
      ]);

      return { data, total, page: query.page, limit: query.limit };
    } catch (error) {
      this.logger.error(`GetWorkflowListHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
