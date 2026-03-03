import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { AddStateCommand } from './add-state.command';

@CommandHandler(AddStateCommand)
export class AddStateHandler implements ICommandHandler<AddStateCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: AddStateCommand) {
    const workflow = await this.prisma.workflow.findUnique({ where: { id: cmd.workflowId } });
    if (!workflow) throw new NotFoundException(`Workflow "${cmd.workflowId}" not found`);

    const existing = await this.prisma.workflowState.findFirst({
      where: { workflowId: cmd.workflowId, code: cmd.code },
    });
    if (existing) throw new ConflictException(`State code "${cmd.code}" already exists in this workflow`);

    return this.prisma.workflowState.create({
      data: {
        workflowId: cmd.workflowId,
        name: cmd.name,
        code: cmd.code,
        stateType: cmd.stateType as any,
        category: cmd.category as any,
        color: cmd.color,
        icon: cmd.icon,
        sortOrder: cmd.sortOrder ?? 0,
        metadata: cmd.metadata,
      },
    });
  }
}
