import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { IChannelAdapter, ChannelSendParams, ChannelSendResult } from './channel-adapter.interface';

@Injectable()
export class SmsAdapter implements IChannelAdapter {
  readonly channel = 'SMS';
  private readonly logger = new Logger(SmsAdapter.name);

  constructor(private readonly prisma: PrismaService) {}

  async send(params: ChannelSendParams): Promise<ChannelSendResult> {
    try {
      this.logger.log(`[SMS] Sending to ${params.recipientAddr || params.recipientId}: ${params.body?.substring(0, 100)}`);

      await this.prisma.communicationLog.create({
        data: {
          channel: 'SMS',
          recipientId: params.recipientId,
          recipientAddr: params.recipientAddr,
          body: params.body,
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      return { success: true, messageId: `sms-${Date.now()}` };
    } catch (error) {
      this.logger.error(`SMS send failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
