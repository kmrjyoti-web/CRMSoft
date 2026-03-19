import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CompleteOnboardingStepCommand } from './complete-onboarding-step.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@CommandHandler(CompleteOnboardingStepCommand)
export class CompleteOnboardingStepHandler implements ICommandHandler<CompleteOnboardingStepCommand> {
  private readonly logger = new Logger(CompleteOnboardingStepHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CompleteOnboardingStepCommand) {
    const tenant = await this.prisma.tenant.update({
      where: { id: command.tenantId },
      data: { onboardingStep: command.step },
    });

    this.logger.log(`Onboarding step updated for tenant ${tenant.id}: ${command.step}`);
    return tenant;
  }
}
