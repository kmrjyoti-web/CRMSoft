import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { WaApiService } from './wa-api.service';

@Injectable()
export class WaChatbotEngineService {
  private readonly logger = new Logger(WaChatbotEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly waApiService: WaApiService,
  ) {}

  async checkAndTrigger(wabaId: string, conversationId: string, message: any): Promise<void> {
    const conversation = await this.prisma.waConversation.findUniqueOrThrow({
      where: { id: conversationId },
    });

    // Skip if conversation is assigned to an agent
    if (conversation.assignedToId) return;

    const text = (message.textBody || '').toLowerCase().trim();

    // Check for keyword-triggered flows
    const flows = await this.prisma.waChatbotFlow.findMany({
      where: { wabaId, status: 'ACTIVE' },
    });

    let matchedFlow: (typeof flows)[number] | undefined = undefined;

    for (const flow of flows) {
      const keywords = flow.triggerKeywords || [];
      if (keywords.some((kw: string) => text.includes(kw.toLowerCase()))) {
        matchedFlow = flow;
        break;
      }
    }

    // Check for default flow if no keyword match
    if (!matchedFlow) {
      matchedFlow = flows.find(f => f.isDefault);
    }

    if (!matchedFlow) return;

    // Increment trigger count
    await this.prisma.waChatbotFlow.update({
      where: { id: matchedFlow.id },
      data: { triggeredCount: { increment: 1 } },
    });

    await this.executeFlow(wabaId, conversationId, matchedFlow, message);
  }

  async executeFlow(wabaId: string, conversationId: string, flow: any, triggerMessage: any): Promise<void> {
    const nodes = (flow.nodes as any[]) || [];
    if (nodes.length === 0) return;

    const conversation = await this.prisma.waConversation.findUniqueOrThrow({
      where: { id: conversationId },
    });

    for (const node of nodes) {
      try {
        await this.processNode(wabaId, conversation, node, triggerMessage);
      } catch (error: any) {
        this.logger.error(`Error processing chatbot node ${node.type}: ${error.message}`);
        break;
      }
    }

    // Increment completed count
    await this.prisma.waChatbotFlow.update({
      where: { id: flow.id },
      data: { completedCount: { increment: 1 } },
    });
  }

  private async processNode(wabaId: string, conversation: any, node: any, triggerMessage: any): Promise<void> {
    switch (node.type) {
      case 'WELCOME':
      case 'TEXT_REPLY':
        if (node.text) {
          await this.sendChatbotMessage(wabaId, conversation, node.text);
        }
        break;

      case 'MENU':
      case 'QUICK_BUTTONS':
        if (node.interactiveData) {
          await this.waApiService.sendInteractive(
            wabaId, conversation.contactPhone, node.interactiveType || 'button', node.interactiveData,
          );
          await this.recordChatbotMessage(wabaId, conversation.id, 'INTERACTIVE', '[Menu]');
        }
        break;

      case 'MEDIA_REPLY':
        if (node.mediaUrl) {
          await this.waApiService.sendMedia(
            wabaId, conversation.contactPhone, node.mediaType || 'image', node.mediaUrl, node.caption,
          );
          await this.recordChatbotMessage(wabaId, conversation.id, 'IMAGE', node.caption || '[Media]');
        }
        break;

      case 'ASSIGN_AGENT':
        if (node.assignToUserId) {
          await this.prisma.waConversation.update({
            where: { id: conversation.id },
            data: { assignedToId: node.assignToUserId },
          });
        }
        break;

      case 'DELAY':
        if (node.delayMs) {
          await new Promise(resolve => setTimeout(resolve, node.delayMs));
        }
        break;

      case 'TAG_CONTACT':
        if (node.tag) {
          await this.prisma.waConversation.update({
            where: { id: conversation.id },
            data: { tags: { push: node.tag } },
          });
        }
        break;

      case 'COLLECT_INPUT':
        if (node.promptText) {
          await this.sendChatbotMessage(wabaId, conversation, node.promptText);
        }
        break;

      case 'CONDITION':
        // Evaluate conditions and branch — simplified
        this.logger.debug(`Condition node evaluation for conversation ${conversation.id}`);
        break;

      case 'API_CALL':
        this.logger.debug(`API call node for conversation ${conversation.id}: ${node.url}`);
        break;

      case 'LINK_LEAD':
        this.logger.debug(`Link lead node for conversation ${conversation.id}`);
        break;
    }
  }

  private async sendChatbotMessage(wabaId: string, conversation: any, text: string): Promise<void> {
    await this.waApiService.sendText(wabaId, conversation.contactPhone, text);
    await this.recordChatbotMessage(wabaId, conversation.id, 'TEXT', text);
  }

  private async recordChatbotMessage(wabaId: string, conversationId: string, type: string, snippet: string): Promise<void> {
    await this.prisma.waMessage.create({
      data: {
        wabaId,
        conversationId,
        direction: 'OUTBOUND',
        messageType: type as any,
        status: 'SENT',
        textBody: type === 'TEXT' ? snippet : null,
        sentAt: new Date(),
        isChatbotReply: true,
      },
    });
  }
}
