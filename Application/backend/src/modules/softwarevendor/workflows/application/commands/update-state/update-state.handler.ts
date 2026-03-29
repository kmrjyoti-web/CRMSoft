import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { UpdateStateCommand } from './update-state.command';

@CommandHandler(UpdateStateCommand)
export class UpdateStateHandler implements ICommandHandler<UpdateStateCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdateStateCommand) {
    const state = await this.prisma.workflowState.findUnique({ where: { id: cmd.stateId } });
    if (!state) throw new NotFoundException(`State "${cmd.stateId}" not found`);
    return this.prisma.workflowState.update({ where: { id: cmd.stateId }, data: cmd.data as any });
  }
}
