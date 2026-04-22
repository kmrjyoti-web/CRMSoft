import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DisconnectCloudCommand } from './disconnect-cloud.command';
import { CloudProviderService } from '../../../services/cloud-provider.service';

@CommandHandler(DisconnectCloudCommand)
export class DisconnectCloudHandler implements ICommandHandler<DisconnectCloudCommand> {
    private readonly logger = new Logger(DisconnectCloudHandler.name);

  constructor(private readonly cloudProvider: CloudProviderService) {}

  async execute(command: DisconnectCloudCommand) {
    try {
      await this.cloudProvider.disconnectProvider(command.userId, command.provider);
      return { success: true };
    } catch (error) {
      this.logger.error(`DisconnectCloudHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
