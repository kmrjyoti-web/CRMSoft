import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { VerificationModule } from '../../../softwarevendor/verification/verification.module';
import { PcConfigModule } from '../../pc-config/pc-config.module';

@Module({
  imports: [VerificationModule, PcConfigModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
