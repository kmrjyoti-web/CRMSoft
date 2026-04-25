import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { RestoreUserCommand } from './restore-user.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@CommandHandler(RestoreUserCommand)
export class RestoreUserHandler implements ICommandHandler<RestoreUserCommand> {
  private readonly logger = new Logger(RestoreUserHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: RestoreUserCommand): Promise<void> {
    try {
      const user = await this.prisma.identity.user.findUnique({ where: { id: command.userId } });
      if (!user) throw new NotFoundException(`User ${command.userId} not found`);

      if (!user.isDeleted) {
        throw new Error('User is not deleted');
      }

      await this.prisma.identity.user.update({
        where: { id: command.userId },
        data: {
          isDeleted: false,
          deletedAt: null,
          deletedById: null,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`User ${command.userId} restored`);
    } catch (error) {
      this.logger.error(`RestoreUserHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
