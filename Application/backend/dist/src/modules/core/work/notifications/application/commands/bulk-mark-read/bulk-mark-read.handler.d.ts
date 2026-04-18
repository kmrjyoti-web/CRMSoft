import { ICommandHandler } from '@nestjs/cqrs';
import { BulkMarkReadCommand } from './bulk-mark-read.command';
import { NotificationCoreService } from '../../../services/notification-core.service';
export declare class BulkMarkReadHandler implements ICommandHandler<BulkMarkReadCommand> {
    private readonly notificationCore;
    private readonly logger;
    constructor(notificationCore: NotificationCoreService);
    execute(command: BulkMarkReadCommand): Promise<{
        updated: number;
    }>;
}
