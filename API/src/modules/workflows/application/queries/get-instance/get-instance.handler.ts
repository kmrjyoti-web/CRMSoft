import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetInstanceQuery } from './get-instance.query';

@QueryHandler(GetInstanceQuery)
export class GetInstanceHandler implements IQueryHandler<GetInstanceQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetInstanceQuery) {
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
  }
}
