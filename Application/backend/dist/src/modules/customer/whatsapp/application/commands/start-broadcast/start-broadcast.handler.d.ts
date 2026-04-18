import { ICommandHandler } from '@nestjs/cqrs';
import { StartBroadcastCommand } from './start-broadcast.command';
import { WaBroadcastExecutorService } from '../../../services/wa-broadcast-executor.service';
export declare class StartBroadcastHandler implements ICommandHandler<StartBroadcastCommand> {
    private readonly broadcastExecutor;
    private readonly logger;
    constructor(broadcastExecutor: WaBroadcastExecutorService);
    execute(cmd: StartBroadcastCommand): Promise<void>;
}
