import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UpdateUserCapacityCommand } from './update-user-capacity.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateUserCapacityCommand)
export class UpdateUserCapacityHandler implements ICommandHandler<UpdateUserCapacityCommand> {
    private readonly logger = new Logger(UpdateUserCapacityHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateUserCapacityCommand) {
    try {
      return this.prisma.userCapacity.upsert({
        where: { userId: command.userId },
        create: { userId: command.userId, ...command.data },
        update: command.data,
      });
    } catch (error) {
      this.logger.error(`UpdateUserCapacityHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
