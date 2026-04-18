import { ICommandHandler } from '@nestjs/cqrs';
import { UnregisterPushCommand } from './unregister-push.command';
import { PreferenceService } from '../../../services/preference.service';
export declare class UnregisterPushHandler implements ICommandHandler<UnregisterPushCommand> {
    private readonly preferenceService;
    private readonly logger;
    constructor(preferenceService: PreferenceService);
    execute(command: UnregisterPushCommand): Promise<{
        unregistered: number;
    }>;
}
