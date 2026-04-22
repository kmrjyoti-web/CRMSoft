import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { WaApiService } from './wa-api.service';
import { WaConversationService } from './wa-conversation.service';
import { WaWindowCheckerService } from './wa-window-checker.service';

@Injectable()
export class WaMessageSenderService {
  private readonly logger = new Logger(WaMessageSenderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly waApiService: WaApiService,
    private readonly conversationService: WaConversationService,
    private readonly windowChecker: WaWindowCheckerService,
  ) {}

  async sendText(wabaId: string, conversationId: string, text: string, senderUserId?: string) {
    const conversation = await this.prisma.working.waConversation.findUniqueOrThrow({
      where: { id: conversationId },
    });

    await this.checkOptOut(wabaId, conversation.contactPhone);
    this.ensureWindowOpen(conversation.windowExpiresAt);

    const result = await this.waApiService.sendText(wabaId, conversation.contactPhone, text);

    const message = await this.prisma.working.waMessage.create({
      data: {
        wabaId,
        conversationId,
        waMessageId: result.messages?.[0]?.id,
        direction: 'OUTBOUND',
        messageType: 'TEXT',
        status: 'SENT',
        textBody: text,
        sentAt: new Date(),
        senderUserId,
      },
    });

    await this.conversationService.updateLastMessage(conversationId, text.substring(0, 200), 'OUTBOUND');
    await this.incrementWabaSent(wabaId);

    return message;
  }

  async sendTemplate(wabaId: string, conversationId: string, templateId: string, variables?: any, senderUserId?: string) {
    const conversation = await this.prisma.working.waConversation.findUniqueOrThrow({
      where: { id: conversationId },
    });
    const template = await this.prisma.working.waTemplate.findUniqueOrThrow({
      where: { id: templateId },
    });

    await this.checkOptOut(wabaId, conversation.contactPhone);
    // Templates bypass the 24-hour window

    const components = variables ? this.buildTemplateComponents(variables) : undefined;
    const result = await this.waApiService.sendTemplate(
      wabaId, conversation.contactPhone, template.name, template.language, components,
    );

    const message = await this.prisma.working.waMessage.create({
      data: {
        wabaId,
        conversationId,
        waMessageId: result.messages?.[0]?.id,
        direction: 'OUTBOUND',
        messageType: 'TEMPLATE',
        status: 'SENT',
        templateId: template.id,
        templateName: template.name,
        templateVariables: variables,
        sentAt: new Date(),
        senderUserId,
      },
    });

    await this.conversationService.updateLastMessage(conversationId, `[Template: ${template.name}]`, 'OUTBOUND');
    await this.incrementWabaSent(wabaId);
    await this.prisma.working.waTemplate.update({
      where: { id: templateId },
      data: { sentCount: { increment: 1 } },
    });

    return message;
  }

  async sendMedia(wabaId: string, conversationId: string, type: string, mediaUrl: string, caption?: string, senderUserId?: string) {
    const conversation = await this.prisma.working.waConversation.findUniqueOrThrow({
      where: { id: conversationId },
    });

    await this.checkOptOut(wabaId, conversation.contactPhone);
    this.ensureWindowOpen(conversation.windowExpiresAt);

    const result = await this.waApiService.sendMedia(wabaId, conversation.contactPhone, type, mediaUrl, caption);

    const message = await this.prisma.working.waMessage.create({
      data: {
        wabaId,
        conversationId,
        waMessageId: result.messages?.[0]?.id,
        direction: 'OUTBOUND',
        messageType: type.toUpperCase() as any,
        status: 'SENT',
        mediaUrl,
        mediaCaption: caption,
        sentAt: new Date(),
        senderUserId,
      },
    });

    await this.conversationService.updateLastMessage(conversationId, caption || `[${type}]`, 'OUTBOUND');
    await this.incrementWabaSent(wabaId);

    return message;
  }

  async sendInteractive(wabaId: string, conversationId: string, interactiveType: string, interactiveData: any, senderUserId?: string) {
    const conversation = await this.prisma.working.waConversation.findUniqueOrThrow({
      where: { id: conversationId },
    });

    await this.checkOptOut(wabaId, conversation.contactPhone);
    this.ensureWindowOpen(conversation.windowExpiresAt);

    const result = await this.waApiService.sendInteractive(wabaId, conversation.contactPhone, interactiveType, interactiveData);

    const message = await this.prisma.working.waMessage.create({
      data: {
        wabaId,
        conversationId,
        waMessageId: result.messages?.[0]?.id,
        direction: 'OUTBOUND',
        messageType: 'INTERACTIVE',
        status: 'SENT',
        interactiveType,
        interactiveData,
        sentAt: new Date(),
        senderUserId,
      },
    });

    await this.conversationService.updateLastMessage(conversationId, '[Interactive message]', 'OUTBOUND');
    await this.incrementWabaSent(wabaId);

    return message;
  }

  async sendLocation(wabaId: string, conversationId: string, lat: number, lng: number, name?: string, address?: string, senderUserId?: string) {
    const conversation = await this.prisma.working.waConversation.findUniqueOrThrow({
      where: { id: conversationId },
    });

    await this.checkOptOut(wabaId, conversation.contactPhone);
    this.ensureWindowOpen(conversation.windowExpiresAt);

    const result = await this.waApiService.sendLocation(wabaId, conversation.contactPhone, lat, lng, name, address);

    const message = await this.prisma.working.waMessage.create({
      data: {
        wabaId,
        conversationId,
        waMessageId: result.messages?.[0]?.id,
        direction: 'OUTBOUND',
        messageType: 'LOCATION',
        status: 'SENT',
        latitude: lat,
        longitude: lng,
        locationName: name,
        locationAddress: address,
        sentAt: new Date(),
        senderUserId,
      },
    });

    await this.conversationService.updateLastMessage(conversationId, name || '[Location]', 'OUTBOUND');
    await this.incrementWabaSent(wabaId);

    return message;
  }

  private async checkOptOut(wabaId: string, phoneNumber: string): Promise<void> {
    const optOut = await this.prisma.working.waOptOut.findFirst({
      where: { wabaId, phoneNumber },
    });
    if (optOut) {
      throw new BadRequestException('Contact has opted out of WhatsApp messages');
    }
  }

  private ensureWindowOpen(windowExpiresAt: Date | null): void {
    if (!this.windowChecker.isWindowOpen(windowExpiresAt)) {
      throw new BadRequestException('24-hour messaging window is closed. Use a template message instead.');
    }
  }

  private buildTemplateComponents(variables: any): any[] {
    const components: any[] = [];
    if (variables.header) {
      components.push({ type: 'header', parameters: variables.header });
    }
    if (variables.body) {
      components.push({
        type: 'body',
        parameters: variables.body.map((v: string) => ({ type: 'text', text: v })),
      });
    }
    if (variables.buttons) {
      components.push(...variables.buttons);
    }
    return components;
  }

  private async incrementWabaSent(wabaId: string): Promise<void> {
    await this.prisma.working.whatsAppBusinessAccount.update({
      where: { id: wabaId },
      data: { totalMessagesSent: { increment: 1 } },
    });
  }
}
