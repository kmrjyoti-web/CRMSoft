import { Module } from '@nestjs/common';
import { WalletController } from './presentation/wallet.controller';
import { WalletAdminController } from './presentation/wallet-admin.controller';
import { WalletService } from './services/wallet.service';
import { WalletTransactionService } from './services/wallet-transaction.service';
import { RechargeService } from './services/recharge.service';
import { CouponService } from './services/coupon.service';
import { ServiceRateService } from './services/service-rate.service';
import { WalletAnalyticsService } from './services/wallet-analytics.service';

@Module({
  controllers: [WalletController, WalletAdminController],
  providers: [
    WalletService,
    WalletTransactionService,
    RechargeService,
    CouponService,
    ServiceRateService,
    WalletAnalyticsService,
  ],
  exports: [WalletService, WalletTransactionService, ServiceRateService],
})
export class WalletModule {}
