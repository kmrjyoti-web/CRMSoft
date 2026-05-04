import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateQuickReplyCommand } from './create-quick-reply.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CreateQuickReplyCommand)
export class CreateQuickReplyHandler implements ICommandHandler<CreateQuickReplyCommand> {
  private readonly logger = new Logger(CreateQuickReplyHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CreateQuickReplyCommand) {
    try {
      const quickReply = await this.prisma.working.waQuickReply.create({
        data: {
          wabaId: cmd.wabaId,
          shortcut: cmd.shortcut,
          message: cmd.message,
          category: cmd.category,
          createdById: cmd.userId,
        },
      });

      this.logger.log(`Quick reply created: ${quickReply.id} (/${cmd.shortcut}) for WABA ${cmd.wabaId}`);
      return quickReply;
    } catch (error) {
      this.logger.error(`CreateQuickReplyHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
