import { OnboardingStep } from '@prisma/client';

export class CompleteOnboardingStepCommand {
  constructor(
    public readonly tenantId: string,
    public readonly step: OnboardingStep,
  ) {}
}
