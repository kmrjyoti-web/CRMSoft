import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { VerificationModule } from '../softwarevendor/verification/verification.module';

// ─── SaaS Marketplace (Vendors, Modules, Installs) ───
import { VendorService } from './services/vendor.service';
import { MarketplaceModuleService } from './services/marketplace-module.service';
import { MarketplaceInstallService } from './services/marketplace-install.service';
import { ReviewService } from './services/review.service';
import { MarketplaceController } from './presentation/marketplace.controller';
import { VendorController } from './presentation/vendor.controller';

// ─── Marketplace Feed (Listings, Posts, Orders, Enquiries) ───
import { ListingService } from './services/listing.service';
import { PostService } from './services/post.service';
import { EnquiryService } from './services/enquiry.service';
import { OrderService } from './services/order.service';
import { MarketplaceSchedulingService } from './services/scheduling.service';
import {
  ListingController,
  PostController,
  EnquiryController,
  OrderController,
} from './presentation/marketplace-feed.controller';

const SERVICES = [
  VendorService,
  MarketplaceModuleService,
  MarketplaceInstallService,
  ReviewService,
  ListingService,
  PostService,
  EnquiryService,
  OrderService,
  MarketplaceSchedulingService,
];

const CONTROLLERS = [
  MarketplaceController,
  VendorController,
  ListingController,
  PostController,
  EnquiryController,
  OrderController,
];

@Module({
  imports: [PrismaModule, VerificationModule],
  controllers: CONTROLLERS,
  providers: SERVICES,
  exports: [
    MarketplaceInstallService,
    ListingService,
    PostService,
    EnquiryService,
    OrderService,
    MarketplaceSchedulingService,
  ],
})
export class MarketplaceModule {}
