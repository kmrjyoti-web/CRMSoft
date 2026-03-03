import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CancelBroadcastCommand } from './cancel-broadcast.command';
import { WaBroadcastExecutorService } from '../../../services/wa-broadcast-executor.service';

@CommandHandler(CancelBroadcastCommand)
export class CancelBroadcastHandler implements ICommandHandler<CancelBroadcastCommand> {
  private readonly logger = new Logger(CancelBroadcastHandler.name);

  constructor(private readonly broadcastExecutor: WaBroadcastExecutorService) {}

  async execute(cmd: CancelBroadcastCommand) {
    await this.broadcastExecutor.cancelBroadcast(cmd.broadcastId);
    this.logger.log(`Broadcast ${cmd.broadcastId} cancelled`);
  }
}
