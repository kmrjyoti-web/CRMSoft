import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IChannelAdapter, ChannelSendParams, ChannelSendResult } from './channel-adapter.interface';
import { getErrorMessage } from '@/common/utils/error.utils';

@Injectable()
export class WhatsAppAdapter implements IChannelAdapter {
  readonly channel = 'WHATSAPP';
  private readonly logger = new Logger(WhatsAppAdapter.name);

  constructor(private readonly prisma: PrismaService) {}

  async send(params: ChannelSendParams): Promise<ChannelSendResult> {
    try {
      this.logger.log(`[WHATSAPP] Sending to ${params.recipientAddr || params.recipientId}: ${params.body?.substring(0, 100)}`);

      await this.prisma.communicationLog.create({
        data: {
          channel: 'WHATSAPP',
          recipientId: params.recipientId,
          recipientAddr: params.recipientAddr,
          body: params.body,
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      return { success: true, messageId: `wa-${Date.now()}` };
    } catch (error) {
      this.logger.error(`WhatsApp send failed: ${getErrorMessage(error)}`);
      return { success: false, error: getErrorMessage(error) };
    }
  }
}
