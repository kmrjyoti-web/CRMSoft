import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { IChannelAdapter, ChannelSendParams, ChannelSendResult } from './channel-adapter.interface';

@Injectable()
export class CallAdapter implements IChannelAdapter {
  readonly channel = 'CALL';
  private readonly logger = new Logger(CallAdapter.name);

  constructor(private readonly prisma: PrismaService) {}

  async send(params: ChannelSendParams): Promise<ChannelSendResult> {
    try {
      this.logger.log(`[CALL] Would call ${params.recipientAddr || params.recipientId}: ${params.subject}`);

      await this.prisma.communicationLog.create({
        data: {
          channel: 'IN_APP', // Call uses IN_APP channel type as CALL isn't in NotificationChannel enum
          recipientId: params.recipientId,
          recipientAddr: params.recipientAddr,
          subject: params.subject,
          body: params.body,
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      return { success: true, messageId: `call-${Date.now()}` };
    } catch (error) {
      this.logger.error(`Call initiation failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
