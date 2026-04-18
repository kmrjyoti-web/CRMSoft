import { ICommandHandler } from '@nestjs/cqrs';
import { MarkAllReadCommand } from './mark-all-read.command';
import { NotificationCoreService } from '../../../services/notification-core.service';
export declare class MarkAllReadHandler implements ICommandHandler<MarkAllReadCommand> {
    private readonly notificationCore;
    private readonly logger;
    constructor(notificationCore: NotificationCoreService);
    execute(command: MarkAllReadCommand): Promise<{
        updated: number;
    }>;
}
