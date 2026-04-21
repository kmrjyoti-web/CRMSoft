-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('PRODUCT', 'SERVICE', 'REQUIREMENT', 'JOB');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'SOLD_OUT', 'EXPIRED', 'ARCHIVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'PRODUCT_SHARE', 'CUSTOMER_FEEDBACK', 'PRODUCT_LAUNCH', 'POLL', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'HIDDEN', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "EngagementAction" AS ENUM ('LIKE', 'UNLIKE', 'SAVE', 'UNSAVE', 'SHARE', 'VIEW', 'CLICK', 'REPORT');

-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('ONE_TIME', 'DAILY_RECURRING', 'WEEKLY_RECURRING', 'FIRST_N_ORDERS', 'LAUNCH', 'CUSTOM');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FLAT_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y', 'BUNDLE_PRICE');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'EXPIRED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "VisibilityType" AS ENUM ('PUBLIC', 'GEO_TARGETED', 'VERIFIED_ONLY', 'MY_CONTACTS', 'SELECTED_CONTACTS', 'CATEGORY_BASED', 'GRADE_BASED');

-- CreateEnum
CREATE TYPE "ExpiryAction" AS ENUM ('DEACTIVATE', 'ARCHIVE', 'DELETE', 'NOTIFY_OWNER');

-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('IMPRESSION', 'CLICK', 'ENQUIRY', 'LEAD', 'CUSTOMER', 'ORDER', 'SHARE', 'SAVE');

-- CreateEnum
CREATE TYPE "AnalyticsEntityType" AS ENUM ('POST', 'LISTING', 'OFFER');

-- CreateEnum
CREATE TYPE "AnalyticsSource" AS ENUM ('FEED', 'SEARCH', 'SHARE_LINK', 'DIRECT', 'NOTIFICATION', 'QR_CODE', 'EXTERNAL');

-- CreateTable
CREATE TABLE "gv_mkt_listings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "listing_type" "ListingType" NOT NULL,
    "category_id" TEXT,
    "subcategory_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "short_description" TEXT,
    "media_urls" JSONB NOT NULL DEFAULT '[]',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "base_price" INTEGER NOT NULL DEFAULT 0,
    "mrp" INTEGER,
    "min_order_qty" INTEGER NOT NULL DEFAULT 1,
    "max_order_qty" INTEGER,
    "hsn_code" TEXT,
    "gst_rate" DOUBLE PRECISION,
    "track_inventory" BOOLEAN NOT NULL DEFAULT true,
    "stock_available" INTEGER NOT NULL DEFAULT 0,
    "stock_reserved" INTEGER NOT NULL DEFAULT 0,
    "visibility" "VisibilityType" NOT NULL DEFAULT 'PUBLIC',
    "visibility_config" JSONB,
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "publish_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "expiry_action" "ExpiryAction" NOT NULL DEFAULT 'DEACTIVATE',
    "published_at" TIMESTAMP(3),
    "requirement_config" JSONB,
    "shipping_config" JSONB,
    "attributes" JSONB NOT NULL DEFAULT '{}',
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "enquiry_count" INTEGER NOT NULL DEFAULT 0,
    "order_count" INTEGER NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "avg_rating" DOUBLE PRECISION,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "featured_until" TIMESTAMP(3),
    "slug" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "updated_by_id" TEXT,

    CONSTRAINT "gv_mkt_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_listing_price_tiers" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "min_qty" INTEGER NOT NULL,
    "max_qty" INTEGER,
    "price_per_unit" INTEGER NOT NULL,
    "requires_verification" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gv_mkt_listing_price_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_posts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "post_type" "PostType" NOT NULL,
    "content" TEXT,
    "media_urls" JSONB NOT NULL DEFAULT '[]',
    "linked_listing_id" TEXT,
    "linked_offer_id" TEXT,
    "rating" INTEGER,
    "product_id" TEXT,
    "visibility" "VisibilityType" NOT NULL DEFAULT 'PUBLIC',
    "visibility_config" JSONB,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "publish_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "expiry_action" "ExpiryAction" NOT NULL DEFAULT 'DEACTIVATE',
    "published_at" TIMESTAMP(3),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "share_count" INTEGER NOT NULL DEFAULT 0,
    "save_count" INTEGER NOT NULL DEFAULT 0,
    "hashtags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mentions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "poll_config" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_id" TEXT NOT NULL,

    CONSTRAINT "gv_mkt_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_post_engagements" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" "EngagementAction" NOT NULL,
    "shared_to" TEXT,
    "city" TEXT,
    "state" TEXT,
    "device_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gv_mkt_post_engagements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_post_comments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "content" TEXT NOT NULL,
    "media_url" TEXT,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_mkt_post_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_offers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "media_urls" JSONB NOT NULL DEFAULT '[]',
    "offer_type" "OfferType" NOT NULL,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" DOUBLE PRECISION NOT NULL,
    "linked_listing_ids" TEXT[],
    "linked_category_ids" TEXT[],
    "primary_listing_id" TEXT,
    "conditions" JSONB NOT NULL DEFAULT '{}',
    "max_redemptions" INTEGER,
    "current_redemptions" INTEGER NOT NULL DEFAULT 0,
    "auto_close_on_limit" BOOLEAN NOT NULL DEFAULT true,
    "reset_time" TEXT,
    "last_reset_at" TIMESTAMP(3),
    "status" "OfferStatus" NOT NULL DEFAULT 'DRAFT',
    "publish_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "closed_reason" TEXT,
    "impression_count" INTEGER NOT NULL DEFAULT 0,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "enquiry_count" INTEGER NOT NULL DEFAULT 0,
    "lead_count" INTEGER NOT NULL DEFAULT 0,
    "order_count" INTEGER NOT NULL DEFAULT 0,
    "total_order_value" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_id" TEXT NOT NULL,

    CONSTRAINT "gv_mkt_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_offer_redemptions" (
    "id" TEXT NOT NULL,
    "offer_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "order_id" TEXT,
    "discount_applied" INTEGER NOT NULL,
    "order_value" INTEGER,
    "city" TEXT,
    "state" TEXT,
    "device_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gv_mkt_offer_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_reviews" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "media_urls" JSONB NOT NULL DEFAULT '[]',
    "is_verified_purchase" BOOLEAN NOT NULL DEFAULT false,
    "order_id" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "moderator_id" TEXT,
    "moderation_note" TEXT,
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "report_count" INTEGER NOT NULL DEFAULT 0,
    "seller_response" TEXT,
    "seller_responded_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_mkt_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_enquiries" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "enquirer_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "quantity" INTEGER,
    "expected_price" INTEGER,
    "delivery_pincode" TEXT,
    "crm_lead_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_mkt_enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_analytics_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "entity_type" "AnalyticsEntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "event_type" "AnalyticsEventType" NOT NULL,
    "user_id" TEXT,
    "source" "AnalyticsSource" NOT NULL DEFAULT 'FEED',
    "device_type" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "order_value" INTEGER,
    "metadata" JSONB DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gv_mkt_analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_analytics_summaries" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "entity_type" "AnalyticsEntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "unique_impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "unique_clicks" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "enquiries" INTEGER NOT NULL DEFAULT 0,
    "enquiry_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "leads" INTEGER NOT NULL DEFAULT 0,
    "lead_conversion_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "orders" INTEGER NOT NULL DEFAULT 0,
    "order_conversion_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_order_value" INTEGER NOT NULL DEFAULT 0,
    "top_cities" JSONB NOT NULL DEFAULT '[]',
    "top_states" JSONB NOT NULL DEFAULT '[]',
    "peak_hours" JSONB NOT NULL DEFAULT '[]',
    "device_breakdown" JSONB NOT NULL DEFAULT '{}',
    "source_breakdown" JSONB NOT NULL DEFAULT '{}',
    "listing_id" TEXT,
    "post_id" TEXT,
    "offer_id" TEXT,
    "last_computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_mkt_analytics_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_follows" (
    "id" TEXT NOT NULL,
    "follower_id" TEXT NOT NULL,
    "following_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gv_mkt_follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_requirement_quotes" (
    "id" TEXT NOT NULL,
    "requirement_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "price_per_unit" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "delivery_days" INTEGER NOT NULL,
    "credit_days" INTEGER,
    "notes" TEXT,
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_mkt_requirement_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gv_mkt_listings_slug_key" ON "gv_mkt_listings"("slug");

-- CreateIndex
CREATE INDEX "gv_mkt_listings_tenant_id_idx" ON "gv_mkt_listings"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_mkt_listings_tenant_id_status_listing_type_idx" ON "gv_mkt_listings"("tenant_id", "status", "listing_type");

-- CreateIndex
CREATE INDEX "gv_mkt_listings_tenant_id_category_id_idx" ON "gv_mkt_listings"("tenant_id", "category_id");

-- CreateIndex
CREATE INDEX "gv_mkt_listings_status_publish_at_idx" ON "gv_mkt_listings"("status", "publish_at");

-- CreateIndex
CREATE INDEX "gv_mkt_listings_status_expires_at_idx" ON "gv_mkt_listings"("status", "expires_at");

-- CreateIndex
CREATE INDEX "gv_mkt_listing_price_tiers_listing_id_idx" ON "gv_mkt_listing_price_tiers"("listing_id");

-- CreateIndex
CREATE INDEX "gv_mkt_posts_tenant_id_status_created_at_idx" ON "gv_mkt_posts"("tenant_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "gv_mkt_posts_author_id_idx" ON "gv_mkt_posts"("author_id");

-- CreateIndex
CREATE INDEX "gv_mkt_posts_status_publish_at_idx" ON "gv_mkt_posts"("status", "publish_at");

-- CreateIndex
CREATE INDEX "gv_mkt_post_engagements_post_id_idx" ON "gv_mkt_post_engagements"("post_id");

-- CreateIndex
CREATE INDEX "gv_mkt_post_engagements_user_id_idx" ON "gv_mkt_post_engagements"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_mkt_post_engagements_post_id_user_id_action_key" ON "gv_mkt_post_engagements"("post_id", "user_id", "action");

-- CreateIndex
CREATE INDEX "gv_mkt_post_comments_post_id_created_at_idx" ON "gv_mkt_post_comments"("post_id", "created_at");

-- CreateIndex
CREATE INDEX "gv_mkt_offers_tenant_id_status_idx" ON "gv_mkt_offers"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "gv_mkt_offers_status_publish_at_idx" ON "gv_mkt_offers"("status", "publish_at");

-- CreateIndex
CREATE INDEX "gv_mkt_offers_status_expires_at_idx" ON "gv_mkt_offers"("status", "expires_at");

-- CreateIndex
CREATE INDEX "gv_mkt_offers_tenant_id_offer_type_status_idx" ON "gv_mkt_offers"("tenant_id", "offer_type", "status");

-- CreateIndex
CREATE INDEX "gv_mkt_offer_redemptions_offer_id_idx" ON "gv_mkt_offer_redemptions"("offer_id");

-- CreateIndex
CREATE INDEX "gv_mkt_offer_redemptions_user_id_idx" ON "gv_mkt_offer_redemptions"("user_id");

-- CreateIndex
CREATE INDEX "gv_mkt_offer_redemptions_offer_id_user_id_idx" ON "gv_mkt_offer_redemptions"("offer_id", "user_id");

-- CreateIndex
CREATE INDEX "gv_mkt_reviews_listing_id_status_idx" ON "gv_mkt_reviews"("listing_id", "status");

-- CreateIndex
CREATE INDEX "gv_mkt_reviews_reviewer_id_idx" ON "gv_mkt_reviews"("reviewer_id");

-- CreateIndex
CREATE INDEX "gv_mkt_reviews_status_idx" ON "gv_mkt_reviews"("status");

-- CreateIndex
CREATE INDEX "gv_mkt_enquiries_listing_id_idx" ON "gv_mkt_enquiries"("listing_id");

-- CreateIndex
CREATE INDEX "gv_mkt_enquiries_enquirer_id_idx" ON "gv_mkt_enquiries"("enquirer_id");

-- CreateIndex
CREATE INDEX "gv_mkt_enquiries_tenant_id_status_idx" ON "gv_mkt_enquiries"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "gv_mkt_analytics_events_entity_type_entity_id_event_type_idx" ON "gv_mkt_analytics_events"("entity_type", "entity_id", "event_type");

-- CreateIndex
CREATE INDEX "gv_mkt_analytics_events_tenant_id_timestamp_idx" ON "gv_mkt_analytics_events"("tenant_id", "timestamp");

-- CreateIndex
CREATE INDEX "gv_mkt_analytics_events_entity_id_event_type_timestamp_idx" ON "gv_mkt_analytics_events"("entity_id", "event_type", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "gv_mkt_analytics_summaries_listing_id_key" ON "gv_mkt_analytics_summaries"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_mkt_analytics_summaries_post_id_key" ON "gv_mkt_analytics_summaries"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_mkt_analytics_summaries_offer_id_key" ON "gv_mkt_analytics_summaries"("offer_id");

-- CreateIndex
CREATE INDEX "gv_mkt_analytics_summaries_entity_type_entity_id_idx" ON "gv_mkt_analytics_summaries"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "gv_mkt_analytics_summaries_tenant_id_idx" ON "gv_mkt_analytics_summaries"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_mkt_follows_follower_id_idx" ON "gv_mkt_follows"("follower_id");

-- CreateIndex
CREATE INDEX "gv_mkt_follows_following_id_idx" ON "gv_mkt_follows"("following_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_mkt_follows_follower_id_following_id_key" ON "gv_mkt_follows"("follower_id", "following_id");

-- CreateIndex
CREATE INDEX "gv_mkt_requirement_quotes_requirement_id_idx" ON "gv_mkt_requirement_quotes"("requirement_id");

-- CreateIndex
CREATE INDEX "gv_mkt_requirement_quotes_seller_id_idx" ON "gv_mkt_requirement_quotes"("seller_id");

-- AddForeignKey
ALTER TABLE "gv_mkt_listing_price_tiers" ADD CONSTRAINT "gv_mkt_listing_price_tiers_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "gv_mkt_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_mkt_post_engagements" ADD CONSTRAINT "gv_mkt_post_engagements_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "gv_mkt_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_mkt_post_comments" ADD CONSTRAINT "gv_mkt_post_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "gv_mkt_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_mkt_offers" ADD CONSTRAINT "gv_mkt_offers_primary_listing_id_fkey" FOREIGN KEY ("primary_listing_id") REFERENCES "gv_mkt_listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_mkt_offer_redemptions" ADD CONSTRAINT "gv_mkt_offer_redemptions_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "gv_mkt_offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_mkt_reviews" ADD CONSTRAINT "gv_mkt_reviews_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "gv_mkt_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_mkt_enquiries" ADD CONSTRAINT "gv_mkt_enquiries_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "gv_mkt_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_mkt_analytics_summaries" ADD CONSTRAINT "gv_mkt_analytics_summaries_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "gv_mkt_listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_mkt_analytics_summaries" ADD CONSTRAINT "gv_mkt_analytics_summaries_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "gv_mkt_posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_mkt_analytics_summaries" ADD CONSTRAINT "gv_mkt_analytics_summaries_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "gv_mkt_offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

