import { ICommandHandler } from '@nestjs/cqrs';
import { PauseBroadcastCommand } from './pause-broadcast.command';
import { WaBroadcastExecutorService } from '../../../services/wa-broadcast-executor.service';
export declare class PauseBroadcastHandler implements ICommandHandler<PauseBroadcastCommand> {
    private readonly broadcastExecutor;
    private readonly logger;
    constructor(broadcastExecutor: WaBroadcastExecutorService);
    execute(cmd: PauseBroadcastCommand): Promise<void>;
}
