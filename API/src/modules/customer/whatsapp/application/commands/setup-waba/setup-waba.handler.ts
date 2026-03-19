import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SetupWabaCommand } from './setup-waba.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(SetupWabaCommand)
export class SetupWabaHandler implements ICommandHandler<SetupWabaCommand> {
  private readonly logger = new Logger(SetupWabaHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: SetupWabaCommand) {
    const waba = await this.prisma.working.whatsAppBusinessAccount.create({
      data: {
        wabaId: cmd.wabaId,
        phoneNumberId: cmd.phoneNumberId,
        phoneNumber: cmd.phoneNumber,
        displayName: cmd.displayName,
        accessToken: cmd.accessToken,
        webhookVerifyToken: cmd.webhookVerifyToken,
        connectionStatus: 'ACTIVE',
      },
    });

    this.logger.log(`WABA setup complete: ${waba.id} (${cmd.displayName}) phone ${cmd.phoneNumber}`);
    return waba;
  }
}
