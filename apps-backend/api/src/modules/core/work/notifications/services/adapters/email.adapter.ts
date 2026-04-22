import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { IChannelAdapter, ChannelSendParams, ChannelSendResult } from './channel-adapter.interface';
import { getErrorMessage } from '@/common/utils/error.utils';

@Injectable()
export class EmailAdapter implements IChannelAdapter {
  readonly channel = 'EMAIL';
  private readonly logger = new Logger(EmailAdapter.name);

  constructor(private readonly prisma: PrismaService) {}

  async send(params: ChannelSendParams): Promise<ChannelSendResult> {
    try {
      // NOTE: Email integration pending — uses stub adapter
      this.logger.log(`[EMAIL] Sending to ${params.recipientAddr || params.recipientId}: ${params.subject}`);

      await this.prisma.communicationLog.create({
        data: {
          channel: 'EMAIL',
          recipientId: params.recipientId,
          recipientAddr: params.recipientAddr,
          subject: params.subject,
          body: params.body,
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      return { success: true, messageId: `email-${Date.now()}` };
    } catch (error) {
      this.logger.error(`Email send failed: ${getErrorMessage(error)}`);

      await this.prisma.communicationLog.create({
        data: {
          channel: 'EMAIL',
          recipientId: params.recipientId,
          recipientAddr: params.recipientAddr,
          subject: params.subject,
          body: params.body,
          status: 'FAILED',
          errorMessage: getErrorMessage(error),
        },
      });

      return { success: false, error: getErrorMessage(error) };
    }
  }
}
