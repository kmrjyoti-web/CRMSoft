import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConnectCloudCommand } from './connect-cloud.command';
import { CloudProviderService } from '../../../services/cloud-provider.service';

@CommandHandler(ConnectCloudCommand)
export class ConnectCloudHandler implements ICommandHandler<ConnectCloudCommand> {
  constructor(private readonly cloudProvider: CloudProviderService) {}

  async execute(command: ConnectCloudCommand) {
    return this.cloudProvider.connectProvider(
      command.userId,
      command.provider,
      command.accessToken,
      command.refreshToken,
      command.tokenExpiry,
      command.accountEmail,
      command.accountName,
    );
  }
}
