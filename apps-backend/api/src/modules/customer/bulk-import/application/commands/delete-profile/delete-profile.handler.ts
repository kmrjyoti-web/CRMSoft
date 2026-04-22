import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { DeleteProfileCommand } from './delete-profile.command';

@CommandHandler(DeleteProfileCommand)
export class DeleteProfileHandler implements ICommandHandler<DeleteProfileCommand> {
    private readonly logger = new Logger(DeleteProfileHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: DeleteProfileCommand) {
    try {
      return this.prisma.working.importProfile.update({
        where: { id: cmd.profileId },
        data: { status: 'ARCHIVED' },
      });
    } catch (error) {
      this.logger.error(`DeleteProfileHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
