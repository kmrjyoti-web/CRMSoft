import { ICommandHandler } from '@nestjs/cqrs';
import { CancelBroadcastCommand } from './cancel-broadcast.command';
import { WaBroadcastExecutorService } from '../../../services/wa-broadcast-executor.service';
export declare class CancelBroadcastHandler implements ICommandHandler<CancelBroadcastCommand> {
    private readonly broadcastExecutor;
    private readonly logger;
    constructor(broadcastExecutor: WaBroadcastExecutorService);
    execute(cmd: CancelBroadcastCommand): Promise<void>;
}
