import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { WaApiService } from './wa-api.service';

@Injectable()
export class WaChatbotEngineService {
  private readonly logger = new Logger(WaChatbotEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly waApiService: WaApiService,
  ) {}

  async checkAndTrigger(wabaId: string, conversationId: string, message: any): Promise<void> {
    const conversation = await this.prisma.working.waConversation.findUniqueOrThrow({
      where: { id: conversationId },
    });

    // Skip if conversation is assigned to an agent
    if (conversation.assignedToId) return;

    const text = (message.textBody || '').toLowerCase().trim();

    // Check for keyword-triggered flows
    const flows = await this.prisma.working.waChatbotFlow.findMany({
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
    await this.prisma.working.waChatbotFlow.update({
      where: { id: matchedFlow.id },
      data: { triggeredCount: { increment: 1 } },
    });

    await this.executeFlow(wabaId, conversationId, matchedFlow, message);
  }

  async executeFlow(wabaId: string, conversationId: string, flow: any, triggerMessage: any): Promise<void> {
    const nodes = (flow.nodes as any[]) || [];
    if (nodes.length === 0) return;

    const conversation = await this.prisma.working.waConversation.findUniqueOrThrow({
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
    await this.prisma.working.waChatbotFlow.update({
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
          await this.prisma.working.waConversation.update({
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
          await this.prisma.working.waConversation.update({
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
