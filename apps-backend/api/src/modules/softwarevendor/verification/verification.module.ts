import { Module } from '@nestjs/common';
import { OtpService } from './services/otp.service';
import { VerificationService } from './services/verification.service';
import { PricingAccessService } from './services/pricing-access.service';
import { VerificationController } from './presentation/verification.controller';
import { VerificationGuard } from './guards/verification.guard';

@Module({
  controllers: [VerificationController],
  providers: [
    OtpService,
    VerificationService,
    PricingAccessService,
    VerificationGuard,
  ],
  exports: [
    OtpService,
    VerificationService,
    PricingAccessService,
    VerificationGuard,
  ],
})
export class VerificationModule {}
