import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { StarEmailCommand } from './star-email.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(StarEmailCommand)
export class StarEmailHandler implements ICommandHandler<StarEmailCommand> {
    private readonly logger = new Logger(StarEmailHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: StarEmailCommand) {
    try {
      const email = await this.prisma.working.email.update({
        where: { id: cmd.emailId },
        data: { isStarred: cmd.starred },
      });

      return email;
    } catch (error) {
      this.logger.error(`StarEmailHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
