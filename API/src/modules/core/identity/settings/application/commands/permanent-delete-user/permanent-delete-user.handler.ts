import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PermanentDeleteUserCommand } from './permanent-delete-user.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@CommandHandler(PermanentDeleteUserCommand)
export class PermanentDeleteUserHandler implements ICommandHandler<PermanentDeleteUserCommand> {
  private readonly logger = new Logger(PermanentDeleteUserHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: PermanentDeleteUserCommand): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: command.userId } });
    if (!user) throw new NotFoundException(`User ${command.userId} not found`);

    if (!user.isDeleted) {
      throw new BadRequestException(
        'User must be soft-deleted before permanent deletion',
      );
    }

    await this.prisma.user.delete({ where: { id: command.userId } });

    this.logger.log(`User ${command.userId} permanently deleted`);
  }
}
