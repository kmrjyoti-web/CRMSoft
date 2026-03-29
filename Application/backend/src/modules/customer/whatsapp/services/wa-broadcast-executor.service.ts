import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { WaApiService } from './wa-api.service';

@Injectable()
export class WaBroadcastExecutorService {
  private readonly logger = new Logger(WaBroadcastExecutorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly waApiService: WaApiService,
  ) {}

  async executeBroadcast(broadcastId: string): Promise<void> {
    const broadcast = await this.prisma.working.waBroadcast.findUniqueOrThrow({
      where: { id: broadcastId },
      include: { template: true },
    });

    if (!['DRAFT', 'SCHEDULED'].includes(broadcast.status)) {
      throw new BadRequestException(`Broadcast is in ${broadcast.status} status, cannot start`);
    }

    await this.prisma.working.waBroadcast.update({
      where: { id: broadcastId },
      data: { status: 'SENDING', startedAt: new Date() },
    });

    try {
      const recipients = await this.prisma.working.waBroadcastRecipient.findMany({
        where: { broadcastId, status: 'PENDING' },
      });

      // Check opt-outs
      const phoneNumbers = recipients.map(r => r.phoneNumber);
      const optOuts = await this.prisma.working.waOptOut.findMany({
        where: { wabaId: broadcast.wabaId, phoneNumber: { in: phoneNumbers } },
      });
      const optedOutPhones = new Set(optOuts.map(o => o.phoneNumber));

      let sentCount = 0;
      let failedCount = 0;
      let optOutCount = 0;

      for (const recipient of recipients) {
        // Check if broadcast was paused/cancelled
        const current = await this.prisma.working.waBroadcast.findUnique({ where: { id: broadcastId } });
        if (current?.status === 'PAUSED' || current?.status === 'CANCELLED') break;

        if (optedOutPhones.has(recipient.phoneNumber)) {
          await this.prisma.working.waBroadcastRecipient.update({
            where: { id: recipient.id },
            data: { status: 'OPTED_OUT' },
          });
          optOutCount++;
          continue;
        }

        try {
          const variables = (recipient.variables as any) || {};
          const components = this.buildComponents(variables);

          const result = await this.waApiService.sendTemplate(
            broadcast.wabaId,
            recipient.phoneNumber,
            broadcast.template.name,
            broadcast.template.language,
            components.length > 0 ? components : undefined,
          );

          // Create message record
          const message = await this.prisma.working.waMessage.create({
            data: {
              wabaId: broadcast.wabaId,
              conversationId: await this.getOrCreateConversationId(broadcast.wabaId, recipient.phoneNumber, recipient.contactName),
              waMessageId: result.messages?.[0]?.id,
              direction: 'OUTBOUND',
              messageType: 'TEMPLATE',
              status: 'SENT',
              templateId: broadcast.templateId,
              templateName: broadcast.template.name,
              templateVariables: variables,
              sentAt: new Date(),
              broadcastId,
              broadcastRecipientId: recipient.id,
            },
          });

          await this.prisma.working.waBroadcastRecipient.update({
            where: { id: recipient.id },
            data: { status: 'SENT', sentAt: new Date(), waMessageId: message.waMessageId },
          });

          sentCount++;
        } catch (error: any) {
          await this.prisma.working.waBroadcastRecipient.update({
            where: { id: recipient.id },
            data: { status: 'FAILED', failedAt: new Date(), failureReason: error.message },
          });
          failedCount++;
        }

        // Throttle
        if (broadcast.throttlePerSecond > 0) {
          const delayMs = Math.ceil(1000 / broadcast.throttlePerSecond);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }

      const finalStatus = failedCount === recipients.length ? 'FAILED' : 'COMPLETED';
      await this.prisma.working.waBroadcast.update({
        where: { id: broadcastId },
        data: {
          status: finalStatus,
          completedAt: new Date(),
          sentCount,
          failedCount,
          optOutCount,
        },
      });
    } catch (error: any) {
      await this.prisma.working.waBroadcast.update({
        where: { id: broadcastId },
        data: { status: 'FAILED' },
      });
      this.logger.error(`Broadcast ${broadcastId} failed: ${error.message}`);
    }
  }

  async pauseBroadcast(broadcastId: string): Promise<void> {
    await this.prisma.working.waBroadcast.update({
      where: { id: broadcastId },
      data: { status: 'PAUSED' },
    });
  }

  async cancelBroadcast(broadcastId: string): Promise<void> {
    await this.prisma.working.waBroadcast.update({
      where: { id: broadcastId },
      data: { status: 'CANCELLED' },
    });
    await this.prisma.working.waBroadcastRecipient.updateMany({
      where: { broadcastId, status: 'PENDING' },
      data: { status: 'FAILED', failureReason: 'Broadcast cancelled' },
    });
  }

  private buildComponents(variables: any): any[] {
    const components: any[] = [];
    if (variables.body) {
      components.push({
        type: 'body',
        parameters: variables.body.map((v: string) => ({ type: 'text', text: v })),
      });
    }
    if (variables.header) {
      components.push({ type: 'header', parameters: variables.header });
    }
    return components;
  }

  private async getOrCreateConversationId(wabaId: string, phoneNumber: string, contactName?: string | null): Promise<string> {
    let conversation = await this.prisma.working.waConversation.findFirst({
      where: { wabaId, contactPhone: phoneNumber },
    });
    if (!conversation) {
      conversation = await this.prisma.working.waConversation.create({
        data: { wabaId, contactPhone: phoneNumber, contactName, status: 'OPEN' },
      });
    }
    return conversation.id;
  }
}
