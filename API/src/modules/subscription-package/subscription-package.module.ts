import { Module } from '@nestjs/common';
import { SubscriptionPackageController } from './presentation/subscription-package.controller';
import { CouponController } from './presentation/coupon.controller';
import { SubscriptionPackageService } from './services/subscription-package.service';
import { CouponEngineService } from './services/coupon-engine.service';

@Module({
  controllers: [SubscriptionPackageController, CouponController],
  providers: [SubscriptionPackageService, CouponEngineService],
  exports: [SubscriptionPackageService, CouponEngineService],
})
export class SubscriptionPackageModule {}
