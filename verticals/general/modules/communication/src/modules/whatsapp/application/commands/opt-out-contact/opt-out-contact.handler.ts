import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { OptOutContactCommand } from './opt-out-contact.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(OptOutContactCommand)
export class OptOutContactHandler implements ICommandHandler<OptOutContactCommand> {
  private readonly logger = new Logger(OptOutContactHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: OptOutContactCommand) {
    try {
      const existing = await this.prisma.working.waOptOut.findFirst({
        where: { wabaId: cmd.wabaId, phoneNumber: cmd.phoneNumber },
      });

      let optOut;
      if (existing) {
        optOut = await this.prisma.working.waOptOut.update({
          where: { id: existing.id },
          data: {
            contactId: cmd.contactId,
            reason: cmd.reason,
          },
        });
      } else {
        optOut = await this.prisma.working.waOptOut.create({
          data: {
            wabaId: cmd.wabaId,
            phoneNumber: cmd.phoneNumber,
            contactId: cmd.contactId,
            reason: cmd.reason,
          },
        });
      }

      this.logger.log(`Contact opted out: ${cmd.phoneNumber} from WABA ${cmd.wabaId}`);
      return optOut;
    } catch (error) {
      this.logger.error(`OptOutContactHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
