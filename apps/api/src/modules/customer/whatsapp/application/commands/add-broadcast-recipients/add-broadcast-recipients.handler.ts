import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AddBroadcastRecipientsCommand } from './add-broadcast-recipients.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(AddBroadcastRecipientsCommand)
export class AddBroadcastRecipientsHandler implements ICommandHandler<AddBroadcastRecipientsCommand> {
  private readonly logger = new Logger(AddBroadcastRecipientsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: AddBroadcastRecipientsCommand) {
    try {
      const recipientData = command.recipients.map((r) => ({
        broadcastId: command.broadcastId,
        phoneNumber: r.phoneNumber,
        contactName: r.contactName,
        variables: r.variables as any,
      }));

      await this.prisma.working.waBroadcastRecipient.createMany({
        data: recipientData,
      });

      await this.prisma.working.waBroadcast.update({
        where: { id: command.broadcastId },
        data: {
          totalRecipients: { increment: command.recipients.length },
        },
      });

      this.logger.log(
        `Added ${command.recipients.length} recipients to broadcast ${command.broadcastId}`,
      );
    } catch (error) {
      this.logger.error(`AddBroadcastRecipientsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
