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

    const SPACING_X = 250;
    const SPACING_Y = 120;
    const START_X = 100;
    const START_Y = 80;

    return {
      id: workflow.id,
      name: workflow.name,
      nodes: workflow.states.map((s, i) => ({
        id: s.id, code: s.code, name: s.name,
        type: 'default',
        position: {
          x: START_X + (i % 4) * SPACING_X,
          y: START_Y + Math.floor(i / 4) * SPACING_Y,
        },
        data: {
          label: s.name,
          description: s.code,
          nodeCategory: s.category ?? 'action',
          nodeSubType: s.stateType ?? 'default',
          icon: s.icon ?? 'circle',
          color: s.color ?? '#6B7280',
          config: {},
          isConfigured: true,
        },
        stateType: s.stateType, category: s.category,
        color: s.color, icon: s.icon, sortOrder: s.sortOrder,
      })),
      edges: workflow.transitions.map((t) => ({
        id: t.id,
        source: t.fromStateId,
        target: t.toStateId,
        label: t.name,
        type: 'smoothstep',
        animated: true,
        markerEnd: { type: 'arrowclosed', width: 16, height: 16 },
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      })),
    };
  }
}
