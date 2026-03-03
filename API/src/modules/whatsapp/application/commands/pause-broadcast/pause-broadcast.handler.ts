import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PauseBroadcastCommand } from './pause-broadcast.command';
import { WaBroadcastExecutorService } from '../../../services/wa-broadcast-executor.service';

@CommandHandler(PauseBroadcastCommand)
export class PauseBroadcastHandler implements ICommandHandler<PauseBroadcastCommand> {
  private readonly logger = new Logger(PauseBroadcastHandler.name);

  constructor(private readonly broadcastExecutor: WaBroadcastExecutorService) {}

  async execute(cmd: PauseBroadcastCommand) {
    await this.broadcastExecutor.pauseBroadcast(cmd.broadcastId);
    this.logger.log(`Broadcast ${cmd.broadcastId} paused`);
  }
}
