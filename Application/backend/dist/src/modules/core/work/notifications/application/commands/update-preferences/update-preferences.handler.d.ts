import { ICommandHandler } from '@nestjs/cqrs';
import { UpdatePreferencesCommand } from './update-preferences.command';
import { PreferenceService } from '../../../services/preference.service';
export declare class UpdatePreferencesHandler implements ICommandHandler<UpdatePreferencesCommand> {
    private readonly preferenceService;
    private readonly logger;
    constructor(preferenceService: PreferenceService);
    execute(command: UpdatePreferencesCommand): Promise<{
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
        timezone: string;
        channels: import("@prisma/working-client/runtime/library").JsonValue;
        userId: string;
        categories: import("@prisma/working-client/runtime/library").JsonValue;
        quietHoursStart: string | null;
        quietHoursEnd: string | null;
        digestFrequency: import("@prisma/working-client").$Enums.DigestFrequency;
    }>;
}
