import { ICommandHandler } from '@nestjs/cqrs';
import { SyncInboxCommand } from './sync-inbox.command';
import { EmailSyncService } from '../../../services/email-sync.service';
export declare class SyncInboxHandler implements ICommandHandler<SyncInboxCommand> {
    private readonly emailSyncService;
    private readonly logger;
    constructor(emailSyncService: EmailSyncService);
    execute(cmd: SyncInboxCommand): Promise<{
        newEmails: number;
        errors: number;
    }>;
}
