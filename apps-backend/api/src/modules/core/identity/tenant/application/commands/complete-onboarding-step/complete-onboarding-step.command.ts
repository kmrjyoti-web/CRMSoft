import { OnboardingStep } from '@prisma/identity-client';

export class CompleteOnboardingStepCommand {
  constructor(
    public readonly tenantId: string,
    public readonly step: OnboardingStep,
  ) {}
}
