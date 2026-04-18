import { ICommandHandler } from '@nestjs/cqrs';
import { RegisterPushCommand } from './register-push.command';
import { PreferenceService } from '../../../services/preference.service';
export declare class RegisterPushHandler implements ICommandHandler<RegisterPushCommand> {
    private readonly preferenceService;
    private readonly logger;
    constructor(preferenceService: PreferenceService);
    execute(command: RegisterPushCommand): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        userId: string;
        auth: string | null;
        deviceType: string | null;
        endpoint: string;
        p256dh: string | null;
    }>;
}
