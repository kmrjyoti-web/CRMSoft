"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("../../core/prisma/prisma.module");
const verification_module_1 = require("../softwarevendor/verification/verification.module");
const vendor_service_1 = require("./services/vendor.service");
const marketplace_module_service_1 = require("./services/marketplace-module.service");
const marketplace_install_service_1 = require("./services/marketplace-install.service");
const review_service_1 = require("./services/review.service");
const marketplace_controller_1 = require("./presentation/marketplace.controller");
const vendor_controller_1 = require("./presentation/vendor.controller");
const listing_service_1 = require("./services/listing.service");
const post_service_1 = require("./services/post.service");
const enquiry_service_1 = require("./services/enquiry.service");
const order_service_1 = require("./services/order.service");
const scheduling_service_1 = require("./services/scheduling.service");
const marketplace_feed_controller_1 = require("./presentation/marketplace-feed.controller");
const listings_module_1 = require("./listings/listings.module");
const offers_module_1 = require("./offers/offers.module");
const reviews_module_1 = require("./reviews/reviews.module");
const feed_module_1 = require("./feed/feed.module");
const analytics_module_1 = require("./analytics/analytics.module");
const enquiries_module_1 = require("./enquiries/enquiries.module");
const storage_module_1 = require("./storage/storage.module");
const requirements_module_1 = require("./requirements/requirements.module");
const SERVICES = [
    vendor_service_1.VendorService,
    marketplace_module_service_1.MarketplaceModuleService,
    marketplace_install_service_1.MarketplaceInstallService,
    review_service_1.ReviewService,
    listing_service_1.ListingService,
    post_service_1.PostService,
    enquiry_service_1.EnquiryService,
    order_service_1.OrderService,
    scheduling_service_1.MarketplaceSchedulingService,
];
const CONTROLLERS = [
    marketplace_controller_1.MarketplaceController,
    vendor_controller_1.VendorController,
    marketplace_feed_controller_1.ListingController,
    marketplace_feed_controller_1.PostController,
    marketplace_feed_controller_1.EnquiryController,
    marketplace_feed_controller_1.OrderController,
];
let MarketplaceModule = class MarketplaceModule {
};
exports.MarketplaceModule = MarketplaceModule;
exports.MarketplaceModule = MarketplaceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            verification_module_1.VerificationModule,
            bull_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => ({
                    redis: config.get('REDIS_URL', 'redis://localhost:6379'),
                }),
                inject: [config_1.ConfigService],
            }),
            listings_module_1.ListingsModule,
            offers_module_1.OffersModule,
            reviews_module_1.ReviewsModule,
            feed_module_1.FeedModule,
            analytics_module_1.AnalyticsModule,
            enquiries_module_1.EnquiriesModule,
            storage_module_1.StorageModule,
            requirements_module_1.RequirementsModule,
        ],
        controllers: CONTROLLERS,
        providers: SERVICES,
        exports: [
            marketplace_install_service_1.MarketplaceInstallService,
            listing_service_1.ListingService,
            post_service_1.PostService,
            enquiry_service_1.EnquiryService,
            order_service_1.OrderService,
            scheduling_service_1.MarketplaceSchedulingService,
        ],
    })
], MarketplaceModule);
//# sourceMappingURL=marketplace.module.js.map