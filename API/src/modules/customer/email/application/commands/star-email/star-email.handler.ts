import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StarEmailCommand } from './star-email.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(StarEmailCommand)
export class StarEmailHandler implements ICommandHandler<StarEmailCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: StarEmailCommand) {
    const email = await this.prisma.email.update({
      where: { id: cmd.emailId },
      data: { isStarred: cmd.starred },
    });

    return email;
  }
}
