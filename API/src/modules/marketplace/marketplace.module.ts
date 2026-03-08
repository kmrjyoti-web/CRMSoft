import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/prisma/prisma.module';

import { VendorService } from './services/vendor.service';
import { MarketplaceModuleService } from './services/marketplace-module.service';
import { MarketplaceInstallService } from './services/marketplace-install.service';
import { ReviewService } from './services/review.service';

import { MarketplaceController } from './presentation/marketplace.controller';
import { VendorController } from './presentation/vendor.controller';

const SERVICES = [
  VendorService,
  MarketplaceModuleService,
  MarketplaceInstallService,
  ReviewService,
];

const CONTROLLERS = [MarketplaceController, VendorController];

@Module({
  imports: [PrismaModule],
  controllers: CONTROLLERS,
  providers: SERVICES,
  exports: [MarketplaceInstallService],
})
export class MarketplaceModule {}
