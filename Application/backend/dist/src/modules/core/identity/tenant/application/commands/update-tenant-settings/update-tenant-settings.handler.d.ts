import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateTenantSettingsCommand } from './update-tenant-settings.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class UpdateTenantSettingsHandler implements ICommandHandler<UpdateTenantSettingsCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: UpdateTenantSettingsCommand): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/identity-client").$Enums.TenantStatus;
        industryCode: string | null;
        slug: string;
        domain: string | null;
        logo: string | null;
        onboardingStep: import("@prisma/identity-client").$Enums.OnboardingStep;
        settings: import("@prisma/identity-client/runtime/library").JsonValue | null;
        businessTypeId: string | null;
        tradeProfileJson: import("@prisma/identity-client/runtime/library").JsonValue | null;
    }>;
}
