import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DisconnectCloudCommand } from './disconnect-cloud.command';
import { CloudProviderService } from '../../../services/cloud-provider.service';

@CommandHandler(DisconnectCloudCommand)
export class DisconnectCloudHandler implements ICommandHandler<DisconnectCloudCommand> {
  constructor(private readonly cloudProvider: CloudProviderService) {}

  async execute(command: DisconnectCloudCommand) {
    await this.cloudProvider.disconnectProvider(command.userId, command.provider);
    return { success: true };
  }
}
