import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OnboardingStep } from '@prisma/client';

export class OnboardingStepDto {
  @ApiProperty({ enum: OnboardingStep, description: 'Onboarding step to complete' })
  @IsEnum(OnboardingStep)
  step: OnboardingStep;
}
