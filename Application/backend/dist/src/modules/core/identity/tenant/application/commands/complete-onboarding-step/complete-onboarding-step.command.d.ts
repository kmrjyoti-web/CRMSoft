import { OnboardingStep } from '@prisma/identity-client';
export declare class CompleteOnboardingStepCommand {
    readonly tenantId: string;
    readonly step: OnboardingStep;
    constructor(tenantId: string, step: OnboardingStep);
}
