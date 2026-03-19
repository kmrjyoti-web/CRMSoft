import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DisconnectAccountCommand } from './disconnect-account.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(DisconnectAccountCommand)
export class DisconnectAccountHandler implements ICommandHandler<DisconnectAccountCommand> {
  private readonly logger = new Logger(DisconnectAccountHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: DisconnectAccountCommand) {
    const account = await this.prisma.emailAccount.update({
      where: { id: cmd.accountId },
      data: {
        status: 'DISCONNECTED',
        accessToken: null,
        refreshToken: null,
        tokenExpiresAt: null,
        syncEnabled: false,
      },
    });

    this.logger.log(`Email account disconnected: ${cmd.accountId} by user ${cmd.userId}`);
    return account;
  }
}
