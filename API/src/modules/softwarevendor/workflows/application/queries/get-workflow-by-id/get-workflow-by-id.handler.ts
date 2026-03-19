// @ts-nocheck
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetWorkflowByIdQuery } from './get-workflow-by-id.query';

@QueryHandler(GetWorkflowByIdQuery)
export class GetWorkflowByIdHandler implements IQueryHandler<GetWorkflowByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetWorkflowByIdQuery) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: query.id },
      include: {
        states: { orderBy: { sortOrder: 'asc' } },
        transitions: {
          orderBy: { sortOrder: 'asc' },
          include: {
            fromState: { select: { id: true, name: true, code: true } },
            toState: { select: { id: true, name: true, code: true } },
          },
        },
        _count: { select: { instances: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!workflow) throw new NotFoundException(`Workflow "${query.id}" not found`);
    return workflow;
  }
}
