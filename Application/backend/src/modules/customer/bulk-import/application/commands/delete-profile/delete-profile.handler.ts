import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { DeleteProfileCommand } from './delete-profile.command';

@CommandHandler(DeleteProfileCommand)
export class DeleteProfileHandler implements ICommandHandler<DeleteProfileCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: DeleteProfileCommand) {
    return this.prisma.working.importProfile.update({
      where: { id: cmd.profileId },
      data: { status: 'ARCHIVED' },
    });
  }
}
