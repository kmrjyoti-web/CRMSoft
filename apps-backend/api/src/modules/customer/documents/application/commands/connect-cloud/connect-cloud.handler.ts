import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ConnectCloudCommand } from './connect-cloud.command';
import { CloudProviderService } from '../../../services/cloud-provider.service';

@CommandHandler(ConnectCloudCommand)
export class ConnectCloudHandler implements ICommandHandler<ConnectCloudCommand> {
    private readonly logger = new Logger(ConnectCloudHandler.name);

  constructor(private readonly cloudProvider: CloudProviderService) {}

  async execute(command: ConnectCloudCommand) {
    try {
      return this.cloudProvider.connectProvider(
        command.userId,
        command.provider,
        command.accessToken,
        command.refreshToken,
        command.tokenExpiry,
        command.accountEmail,
        command.accountName,
      );
    } catch (error) {
      this.logger.error(`ConnectCloudHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
