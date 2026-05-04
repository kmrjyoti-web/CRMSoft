import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { AddTransitionCommand } from './add-transition.command';

@CommandHandler(AddTransitionCommand)
export class AddTransitionHandler implements ICommandHandler<AddTransitionCommand> {
    private readonly logger = new Logger(AddTransitionHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: AddTransitionCommand) {
    try {
      const workflow = await this.prisma.workflow.findUnique({ where: { id: cmd.workflowId } });
      if (!workflow) throw new NotFoundException(`Workflow "${cmd.workflowId}" not found`);

      const [fromState, toState] = await Promise.all([
        this.prisma.workflowState.findUnique({ where: { id: cmd.fromStateId } }),
        this.prisma.workflowState.findUnique({ where: { id: cmd.toStateId } }),
      ]);
      if (!fromState) throw new NotFoundException(`From state "${cmd.fromStateId}" not found`);
      if (!toState) throw new NotFoundException(`To state "${cmd.toStateId}" not found`);

      const existing = await this.prisma.workflowTransition.findFirst({
        where: { workflowId: cmd.workflowId, code: cmd.code },
      });
      if (existing) throw new ConflictException(`Transition code "${cmd.code}" already exists`);

      return this.prisma.workflowTransition.create({
        data: {
          workflowId: cmd.workflowId,
          fromStateId: cmd.fromStateId,
          toStateId: cmd.toStateId,
          name: cmd.name,
          code: cmd.code,
          triggerType: (cmd.triggerType as any) || 'MANUAL',
          conditions: cmd.conditions as any,
          actions: cmd.actions as any,
          requiredPermission: cmd.requiredPermission,
          requiredRole: cmd.requiredRole,
          sortOrder: cmd.sortOrder ?? 0,
        },
        include: { fromState: { select: { name: true, code: true } }, toState: { select: { name: true, code: true } } },
      });
    } catch (error) {
      this.logger.error(`AddTransitionHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
