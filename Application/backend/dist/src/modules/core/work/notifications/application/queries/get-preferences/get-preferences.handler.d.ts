import { IQueryHandler } from '@nestjs/cqrs';
import { GetPreferencesQuery } from './get-preferences.query';
import { PreferenceService } from '../../../services/preference.service';
export declare class GetPreferencesHandler implements IQueryHandler<GetPreferencesQuery> {
    private readonly preferenceService;
    private readonly logger;
    constructor(preferenceService: PreferenceService);
    execute(query: GetPreferencesQuery): Promise<{
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
