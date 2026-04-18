import { ICommandHandler } from '@nestjs/cqrs';
import { RecalculateUsageCommand } from './recalculate-usage.command';
import { UsageTrackerService } from '../../../services/usage-tracker.service';
export declare class RecalculateUsageHandler implements ICommandHandler<RecalculateUsageCommand> {
    private readonly usageTracker;
    private readonly logger;
    constructor(usageTracker: UsageTrackerService);
    execute(command: RecalculateUsageCommand): Promise<void>;
}
