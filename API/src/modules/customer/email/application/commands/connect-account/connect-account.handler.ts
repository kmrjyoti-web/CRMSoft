import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ConnectAccountCommand } from './connect-account.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(ConnectAccountCommand)
export class ConnectAccountHandler implements ICommandHandler<ConnectAccountCommand> {
  private readonly logger = new Logger(ConnectAccountHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: ConnectAccountCommand) {
    const account = await this.prisma.working.emailAccount.create({
      data: {
        provider: cmd.provider as any,
        userId: cmd.userId,
        emailAddress: cmd.emailAddress,
        displayName: cmd.displayName,
        label: cmd.label,
        accessToken: cmd.accessToken,
        refreshToken: cmd.refreshToken,
        tokenExpiresAt: cmd.tokenExpiresAt,
        imapHost: cmd.imapHost,
        imapPort: cmd.imapPort,
        imapSecure: cmd.imapSecure,
        smtpHost: cmd.smtpHost,
        smtpPort: cmd.smtpPort,
        smtpSecure: cmd.smtpSecure,
        smtpUsername: cmd.smtpUsername,
        smtpPassword: cmd.smtpPassword,
        status: 'ACTIVE',
      },
    });

    this.logger.log(`Email account connected: ${account.id} (${cmd.provider}) for user ${cmd.userId}`);
    return account;
  }
}
