import { ICommandHandler } from '@nestjs/cqrs';
import { BulkDismissCommand } from './bulk-dismiss.command';
import { NotificationCoreService } from '../../../services/notification-core.service';
export declare class BulkDismissHandler implements ICommandHandler<BulkDismissCommand> {
    private readonly notificationCore;
    private readonly logger;
    constructor(notificationCore: NotificationCoreService);
    execute(command: BulkDismissCommand): Promise<{
        dismissed: number;
    }>;
}
