import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { MarkConversationReadCommand } from './mark-conversation-read.command';
import { WaConversationService } from '../../../services/wa-conversation.service';
import { WaApiService } from '../../../services/wa-api.service';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(MarkConversationReadCommand)
export class MarkConversationReadHandler implements ICommandHandler<MarkConversationReadCommand> {
  private readonly logger = new Logger(MarkConversationReadHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationService: WaConversationService,
    private readonly waApiService: WaApiService,
  ) {}

  async execute(cmd: MarkConversationReadCommand) {
    const conversation = await this.prisma.waConversation.findUniqueOrThrow({
      where: { id: cmd.conversationId },
    });

    // Find the last inbound message to mark as read via WhatsApp API
    const lastInboundMessage = await this.prisma.waMessage.findFirst({
      where: {
        conversationId: cmd.conversationId,
        direction: 'INBOUND',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (lastInboundMessage?.waMessageId) {
      await this.waApiService.markAsRead(conversation.wabaId, lastInboundMessage.waMessageId);
    }

    await this.conversationService.markRead(cmd.conversationId);

    this.logger.log(`Conversation ${cmd.conversationId} marked as read by user ${cmd.userId}`);
  }
}
