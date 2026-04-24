import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
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

// ─── Social Commerce Sub-Modules ───
import { ListingsModule } from './listings/listings.module';
import { OffersModule } from './offers/offers.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FeedModule } from './feed/feed.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { EnquiriesModule } from './enquiries/enquiries.module';
import { StorageModule } from './storage/storage.module';
import { RequirementsModule } from './requirements/requirements.module';

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
  imports: [
    PrismaModule,
    VerificationModule,
    // Bull/Redis for offer scheduling and analytics aggregation
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        redis: config.get<string>('REDIS_URL', 'redis://localhost:6379'),
      }),
      inject: [ConfigService],
    }),
    // Social commerce sub-modules
    ListingsModule,
    OffersModule,
    ReviewsModule,
    FeedModule,
    AnalyticsModule,
    EnquiriesModule,
    StorageModule,
    RequirementsModule,
  ],
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
