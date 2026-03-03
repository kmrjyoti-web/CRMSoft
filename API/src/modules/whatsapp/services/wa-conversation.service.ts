import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { WaMessageDirection } from '@prisma/client';

@Injectable()
export class WaConversationService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(wabaId: string, contactPhone: string, contactName?: string, contactPushName?: string) {
    let conversation = await this.prisma.waConversation.findFirst({
      where: { wabaId, contactPhone },
    });

    if (!conversation) {
      conversation = await this.prisma.waConversation.create({
        data: {
          wabaId,
          contactPhone,
          contactName,
          contactPushName,
          status: 'OPEN',
        },
      });
      // Increment WABA total conversations
      await this.prisma.whatsAppBusinessAccount.update({
        where: { id: wabaId },
        data: { totalConversations: { increment: 1 } },
      });
    } else if (contactPushName && !conversation.contactPushName) {
      conversation = await this.prisma.waConversation.update({
        where: { id: conversation.id },
        data: { contactPushName },
      });
    }

    return conversation;
  }

  async assign(conversationId: string, assignToUserId: string) {
    return this.prisma.waConversation.update({
      where: { id: conversationId },
      data: { assignedToId: assignToUserId },
    });
  }

  async resolve(conversationId: string) {
    return this.prisma.waConversation.update({
      where: { id: conversationId },
      data: { status: 'RESOLVED' },
    });
  }

  async reopen(conversationId: string) {
    return this.prisma.waConversation.update({
      where: { id: conversationId },
      data: { status: 'OPEN' },
    });
  }

  async updateLastMessage(conversationId: string, snippet: string, direction: WaMessageDirection) {
    const updateData: any = {
      lastMessageAt: new Date(),
      lastMessageSnippet: snippet,
      lastMessageDirection: direction,
      messageCount: { increment: 1 },
    };
    if (direction === 'INBOUND') {
      updateData.unreadCount = { increment: 1 };
    }
    return this.prisma.waConversation.update({
      where: { id: conversationId },
      data: updateData,
    });
  }

  async markRead(conversationId: string) {
    return this.prisma.waConversation.update({
      where: { id: conversationId },
      data: { unreadCount: 0 },
    });
  }
}
