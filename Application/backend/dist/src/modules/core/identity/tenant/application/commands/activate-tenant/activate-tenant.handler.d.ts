import { ICommandHandler } from '@nestjs/cqrs';
import { ActivateTenantCommand } from './activate-tenant.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class ActivateTenantHandler implements ICommandHandler<ActivateTenantCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: ActivateTenantCommand): Promise<{
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
