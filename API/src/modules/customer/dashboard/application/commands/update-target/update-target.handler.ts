import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateTargetCommand } from './update-target.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(UpdateTargetCommand)
export class UpdateTargetHandler implements ICommandHandler<UpdateTargetCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateTargetCommand) {
    const target = await this.prisma.working.salesTarget.findUnique({ where: { id: command.id } });
    if (!target) throw new NotFoundException('Target not found');

    const data: any = {};
    if (command.targetValue !== undefined) data.targetValue = command.targetValue;
    if (command.name !== undefined) data.name = command.name;
    if (command.notes !== undefined) data.notes = command.notes;
    if (command.isActive !== undefined) data.isActive = command.isActive;

    return this.prisma.working.salesTarget.update({ where: { id: command.id }, data });
  }
}
