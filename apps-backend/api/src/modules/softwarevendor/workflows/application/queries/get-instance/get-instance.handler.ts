import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetInstanceQuery } from './get-instance.query';

@QueryHandler(GetInstanceQuery)
export class GetInstanceHandler implements IQueryHandler<GetInstanceQuery> {
    private readonly logger = new Logger(GetInstanceHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetInstanceQuery) {
    try {
      const instance = await this.prisma.workflowInstance.findUnique({
        where: { id: query.instanceId },
        include: {
          workflow: { select: { id: true, name: true, code: true, entityType: true } },
          currentState: true,
          previousState: true,
          _count: { select: { history: true, approvals: true } },
        },
      });
      if (!instance) throw new NotFoundException(`Instance "${query.instanceId}" not found`);
      return instance;
    } catch (error) {
      this.logger.error(`GetInstanceHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
