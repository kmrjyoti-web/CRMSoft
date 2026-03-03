import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserCapacityCommand } from './update-user-capacity.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateUserCapacityCommand)
export class UpdateUserCapacityHandler implements ICommandHandler<UpdateUserCapacityCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateUserCapacityCommand) {
    return this.prisma.userCapacity.upsert({
      where: { userId: command.userId },
      create: { userId: command.userId, ...command.data },
      update: command.data,
    });
  }
}
