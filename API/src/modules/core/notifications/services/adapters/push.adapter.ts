import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IChannelAdapter, ChannelSendParams, ChannelSendResult } from './channel-adapter.interface';
import { getErrorMessage } from '@/common/utils/error.utils';

@Injectable()
export class PushAdapter implements IChannelAdapter {
  readonly channel = 'PUSH';
  private readonly logger = new Logger(PushAdapter.name);

  constructor(private readonly prisma: PrismaService) {}

  async send(params: ChannelSendParams): Promise<ChannelSendResult> {
    try {
      this.logger.log(`[PUSH] Sending to ${params.recipientId}: ${params.subject}`);

      await this.prisma.communicationLog.create({
        data: {
          channel: 'PUSH',
          recipientId: params.recipientId,
          subject: params.subject,
          body: params.body,
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      return { success: true, messageId: `push-${Date.now()}` };
    } catch (error) {
      this.logger.error(`Push send failed: ${getErrorMessage(error)}`);
      return { success: false, error: getErrorMessage(error) };
    }
  }
}
