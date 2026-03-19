import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { SoftDeleteUserCommand } from './soft-delete-user.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@CommandHandler(SoftDeleteUserCommand)
export class SoftDeleteUserHandler implements ICommandHandler<SoftDeleteUserCommand> {
  private readonly logger = new Logger(SoftDeleteUserHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: SoftDeleteUserCommand): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: command.userId } });
    if (!user) throw new NotFoundException(`User ${command.userId} not found`);

    if (user.isDeleted) {
      throw new Error('User is already deleted');
    }

    await this.prisma.user.update({
      where: { id: command.userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedById: command.deletedById,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`User ${command.userId} soft-deleted by ${command.deletedById}`);
  }
}
