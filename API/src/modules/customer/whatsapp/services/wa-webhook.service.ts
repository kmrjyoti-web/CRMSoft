import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { WaConversationService } from './wa-conversation.service';
import { WaWindowCheckerService } from './wa-window-checker.service';
import { WaEntityLinkerService } from './wa-entity-linker.service';
import { WaChatbotEngineService } from './wa-chatbot-engine.service';

@Injectable()
export class WaWebhookService {
  private readonly logger = new Logger(WaWebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationService: WaConversationService,
    private readonly windowChecker: WaWindowCheckerService,
    private readonly entityLinker: WaEntityLinkerService,
    private readonly chatbotEngine: WaChatbotEngineService,
  ) {}

  verifyWebhook(mode: string, token: string, challenge: string, expectedToken: string): string | null {
    if (mode === 'subscribe' && token === expectedToken) {
      return challenge;
    }
    return null;
  }

  async processWebhook(body: any): Promise<void> {
    const entries = body?.entry || [];
    for (const entry of entries) {
      const changes = entry?.changes || [];
      for (const change of changes) {
        if (change.field !== 'messages') continue;
        const value = change.value;

        // Find WABA by phone number ID
        const phoneNumberId = value?.metadata?.phone_number_id;
        if (!phoneNumberId) continue;

        const waba = await this.prisma.working.whatsAppBusinessAccount.findFirst({
          where: { phoneNumberId },
        });
        if (!waba) {
          this.logger.warn(`No WABA found for phoneNumberId: ${phoneNumberId}`);
          continue;
        }

        // Process inbound messages
        const messages = value?.messages || [];
        for (const msg of messages) {
          await this.handleInboundMessage(waba.id, msg, value?.contacts?.[0]);
        }

        // Process status updates
        const statuses = value?.statuses || [];
        for (const status of statuses) {
          await this.handleStatusUpdate(status);
        }
      }
    }
  }

  private async handleInboundMessage(wabaId: string, msg: any, contact: any): Promise<void> {
    const from = msg.from;
    const contactName = contact?.profile?.name;

    // Get or create conversation
    const conversation = await this.conversationService.getOrCreate(wabaId, from, contactName, contactName);

    // Refresh 24-hour window
    await this.windowChecker.refreshWindow(conversation.id);

    // Determine message type
    const messageType = this.mapMessageType(msg.type);

    // Extract content based on type
    const messageData: any = {
      wabaId,
      conversationId: conversation.id,
      waMessageId: msg.id,
      direction: 'INBOUND',
      messageType,
      status: 'DELIVERED',
      deliveredAt: new Date(),
      contextMessageId: msg.context?.id || null,
      isForwarded: msg.context?.forwarded || false,
    };

    switch (msg.type) {
      case 'text':
        messageData.textBody = msg.text?.body;
        break;
      case 'image':
      case 'video':
      case 'audio':
      case 'document':
      case 'sticker':
        messageData.mediaId = msg[msg.type]?.id;
        messageData.mediaMimeType = msg[msg.type]?.mime_type;
        messageData.mediaCaption = msg[msg.type]?.caption;
        messageData.mediaFileName = msg[msg.type]?.filename;
        break;
      case 'location':
        messageData.latitude = msg.location?.latitude;
        messageData.longitude = msg.location?.longitude;
        messageData.locationName = msg.location?.name;
        messageData.locationAddress = msg.location?.address;
        break;
      case 'contacts':
        messageData.messageType = 'CONTACT_CARD';
        messageData.contactCardData = msg.contacts;
        break;
      case 'interactive':
        if (msg.interactive?.type === 'button_reply') {
          messageData.messageType = 'BUTTON_REPLY';
          messageData.buttonReplyId = msg.interactive.button_reply?.id;
          messageData.buttonReplyTitle = msg.interactive.button_reply?.title;
        } else if (msg.interactive?.type === 'list_reply') {
          messageData.messageType = 'LIST_REPLY';
          messageData.listReplyId = msg.interactive.list_reply?.id;
          messageData.listReplyTitle = msg.interactive.list_reply?.title;
        }
        break;
      case 'reaction':
        messageData.reactionEmoji = msg.reaction?.emoji;
        messageData.reactionMessageId = msg.reaction?.message_id;
        break;
      case 'order':
        messageData.messageType = 'ORDER';
        messageData.interactiveData = msg.order;
        break;
    }

    const message = await this.prisma.working.waMessage.create({ data: messageData });

    // Update conversation
    const snippet = messageData.textBody || messageData.mediaCaption || `[${msg.type}]`;
    await this.conversationService.updateLastMessage(conversation.id, snippet.substring(0, 200), 'INBOUND');

    // Increment WABA received count
    await this.prisma.working.whatsAppBusinessAccount.update({
      where: { id: wabaId },
      data: { totalMessagesReceived: { increment: 1 } },
    });

    // Auto-link to CRM entity if not already linked
    if (!conversation.linkedEntityType) {
      await this.entityLinker.autoLinkByPhone(conversation.id, from);
    }

    // Trigger chatbot
    await this.chatbotEngine.checkAndTrigger(wabaId, conversation.id, message);
  }

  private async handleStatusUpdate(status: any): Promise<void> {
    const waMessageId = status.id;
    const message = await this.prisma.working.waMessage.findFirst({
      where: { waMessageId },
    });
    if (!message) return;

    const updateData: any = {};
    switch (status.status) {
      case 'sent':
        updateData.status = 'SENT';
        updateData.sentAt = new Date(parseInt(status.timestamp) * 1000);
        break;
      case 'delivered':
        updateData.status = 'DELIVERED';
        updateData.deliveredAt = new Date(parseInt(status.timestamp) * 1000);
        break;
      case 'read':
        updateData.status = 'READ';
        updateData.readAt = new Date(parseInt(status.timestamp) * 1000);
        break;
      case 'failed':
        updateData.status = 'FAILED';
        updateData.failedAt = new Date();
        updateData.failureReason = status.errors?.[0]?.message || 'Unknown error';
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.working.waMessage.update({
        where: { id: message.id },
        data: updateData,
      });
    }

    // Update template stats
    if (message.templateId && ['DELIVERED', 'READ'].includes(updateData.status)) {
      const templateUpdate: any = {};
      if (updateData.status === 'DELIVERED') templateUpdate.deliveredCount = { increment: 1 };
      if (updateData.status === 'READ') templateUpdate.readCount = { increment: 1 };
      await this.prisma.working.waTemplate.update({
        where: { id: message.templateId },
        data: templateUpdate,
      });
    }

    // Update broadcast recipient status
    if (message.broadcastRecipientId) {
      const recipientUpdate: any = {};
      if (status.status === 'sent') recipientUpdate.status = 'SENT';
      if (status.status === 'delivered') { recipientUpdate.status = 'DELIVERED'; recipientUpdate.deliveredAt = new Date(); }
      if (status.status === 'read') { recipientUpdate.status = 'READ'; recipientUpdate.readAt = new Date(); }
      if (status.status === 'failed') { recipientUpdate.status = 'FAILED'; recipientUpdate.failedAt = new Date(); recipientUpdate.failureReason = status.errors?.[0]?.message; }

      if (Object.keys(recipientUpdate).length > 0) {
        await this.prisma.working.waBroadcastRecipient.update({
          where: { id: message.broadcastRecipientId },
          data: recipientUpdate,
        });

        // Update broadcast counters
        if (message.broadcastId) {
          const broadcastUpdate: any = {};
          if (status.status === 'delivered') broadcastUpdate.deliveredCount = { increment: 1 };
          if (status.status === 'read') broadcastUpdate.readCount = { increment: 1 };
          if (status.status === 'failed') broadcastUpdate.failedCount = { increment: 1 };
          if (Object.keys(broadcastUpdate).length > 0) {
            await this.prisma.working.waBroadcast.update({
              where: { id: message.broadcastId },
              data: broadcastUpdate,
            });
          }
        }
      }
    }
  }

  private mapMessageType(type: string): any {
    const map: Record<string, string> = {
      text: 'TEXT',
      image: 'IMAGE',
      video: 'VIDEO',
      audio: 'AUDIO',
      document: 'DOCUMENT',
      sticker: 'STICKER',
      location: 'LOCATION',
      contacts: 'CONTACT_CARD',
      interactive: 'INTERACTIVE',
      reaction: 'REACTION',
      order: 'ORDER',
      button: 'BUTTON_REPLY',
    };
    return map[type] || 'UNKNOWN';
  }
}
