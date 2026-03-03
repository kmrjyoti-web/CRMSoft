import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetWorkflowVisualQuery } from './get-workflow-visual.query';

@QueryHandler(GetWorkflowVisualQuery)
export class GetWorkflowVisualHandler implements IQueryHandler<GetWorkflowVisualQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetWorkflowVisualQuery) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: query.id },
      include: {
        states: { orderBy: { sortOrder: 'asc' } },
        transitions: {
          include: {
            fromState: { select: { id: true, name: true, code: true, color: true } },
            toState: { select: { id: true, name: true, code: true, color: true } },
          },
        },
      },
    });
    if (!workflow) throw new NotFoundException(`Workflow "${query.id}" not found`);

    return {
      id: workflow.id,
      name: workflow.name,
      nodes: workflow.states.map((s) => ({
        id: s.id, code: s.code, name: s.name,
        stateType: s.stateType, category: s.category,
        color: s.color, icon: s.icon, sortOrder: s.sortOrder,
      })),
      edges: workflow.transitions.map((t) => ({
        id: t.id, code: t.code, name: t.name,
        from: t.fromState.code, to: t.toState.code,
        triggerType: t.triggerType,
        fromNode: t.fromState, toNode: t.toState,
      })),
    };
  }
}
