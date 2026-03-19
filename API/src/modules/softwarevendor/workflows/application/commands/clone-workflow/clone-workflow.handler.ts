import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { CloneWorkflowCommand } from './clone-workflow.command';

@CommandHandler(CloneWorkflowCommand)
export class CloneWorkflowHandler implements ICommandHandler<CloneWorkflowCommand> {
  private readonly logger = new Logger(CloneWorkflowHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CloneWorkflowCommand) {
    const source = await this.prisma.workflow.findUnique({
      where: { id: cmd.sourceId },
      include: { states: true, transitions: true },
    });
    if (!source) throw new NotFoundException(`Source workflow "${cmd.sourceId}" not found`);

    return this.prisma.$transaction(async (tx) => {
      const clone = await tx.workflow.create({
        data: {
          name: `${source.name} (Copy)`,
          code: `${source.code}_COPY_${Date.now()}`,
          entityType: source.entityType,
          description: source.description,
          isDefault: false,
          configJson: source.configJson === null ? Prisma.JsonNull : source.configJson ?? undefined,
          createdById: cmd.createdById,
        },
      });

      const stateMap = new Map<string, string>();
      for (const state of source.states) {
        const newState = await tx.workflowState.create({
          data: {
            workflowId: clone.id,
            name: state.name,
            code: state.code,
            stateType: state.stateType,
            category: state.category,
            color: state.color,
            icon: state.icon,
            sortOrder: state.sortOrder,
            metadata: state.metadata === null ? Prisma.JsonNull : state.metadata ?? undefined,
          },
        });
        stateMap.set(state.id, newState.id);
      }

      for (const t of source.transitions) {
        await tx.workflowTransition.create({
          data: {
            workflowId: clone.id,
            fromStateId: stateMap.get(t.fromStateId)!,
            toStateId: stateMap.get(t.toStateId)!,
            name: t.name,
            code: t.code,
            triggerType: t.triggerType,
            conditions: t.conditions === null ? Prisma.JsonNull : t.conditions ?? undefined,
            actions: t.actions === null ? Prisma.JsonNull : t.actions ?? undefined,
            requiredPermission: t.requiredPermission,
            requiredRole: t.requiredRole,
            sortOrder: t.sortOrder,
          },
        });
      }

      this.logger.log(`Cloned workflow ${source.code} → ${clone.code}`);
      return clone;
    });
  }
}
