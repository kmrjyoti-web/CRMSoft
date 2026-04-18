import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { StartBroadcastCommand } from './start-broadcast.command';
import { WaBroadcastExecutorService } from '../../../services/wa-broadcast-executor.service';

@CommandHandler(StartBroadcastCommand)
export class StartBroadcastHandler implements ICommandHandler<StartBroadcastCommand> {
  private readonly logger = new Logger(StartBroadcastHandler.name);

  constructor(private readonly broadcastExecutor: WaBroadcastExecutorService) {}

  async execute(cmd: StartBroadcastCommand) {
    try {
      await this.broadcastExecutor.executeBroadcast(cmd.broadcastId);
      this.logger.log(`Broadcast ${cmd.broadcastId} started by user ${cmd.userId}`);
    } catch (error) {
      this.logger.error(`StartBroadcastHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
