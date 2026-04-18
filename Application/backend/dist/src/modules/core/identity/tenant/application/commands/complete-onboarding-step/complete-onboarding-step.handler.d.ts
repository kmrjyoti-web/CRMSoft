import { ICommandHandler } from '@nestjs/cqrs';
import { CompleteOnboardingStepCommand } from './complete-onboarding-step.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class CompleteOnboardingStepHandler implements ICommandHandler<CompleteOnboardingStepCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: CompleteOnboardingStepCommand): Promise<{
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
