-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('RAW', 'VALIDATED');

-- CreateEnum
CREATE TYPE "ContactSource" AS ENUM ('MANUAL', 'BULK_IMPORT', 'WEB_FORM', 'REFERRAL', 'API');

-- CreateEnum
CREATE TYPE "RuleConditionOperator" AS ENUM ('EQUALS', 'NOT_EQUALS', 'CONTAINS', 'GREATER_THAN', 'LESS_THAN', 'IN', 'NOT_IN', 'IS_EMPTY', 'IS_NOT_EMPTY');

-- CreateEnum
CREATE TYPE "CalendarSourceType" AS ENUM ('TASK', 'ACTIVITY', 'DEMO', 'TOUR_PLAN', 'REMINDER', 'FOLLOW_UP', 'SCHEDULED_EVENT', 'EXTERNAL_GOOGLE', 'EXTERNAL_OUTLOOK');

-- CreateEnum
CREATE TYPE "DuplicateConfidence" AS ENUM ('EXACT', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "ValidatorType" AS ENUM ('REQUIRED', 'EMAIL', 'INDIAN_MOBILE', 'PHONE', 'GST_NUMBER', 'PAN_NUMBER', 'TAN_NUMBER', 'AADHAAR', 'IFSC_CODE', 'PINCODE', 'WEBSITE', 'URL', 'NUMERIC', 'DECIMAL', 'DATE', 'ENUM', 'CUSTOM_REGEX', 'MIN_LENGTH', 'MAX_LENGTH');

-- CreateEnum
CREATE TYPE "WaChatbotNodeType" AS ENUM ('WELCOME', 'KEYWORD_TRIGGER', 'MENU', 'TEXT_REPLY', 'MEDIA_REPLY', 'QUICK_BUTTONS', 'COLLECT_INPUT', 'CONDITION', 'API_CALL', 'ASSIGN_AGENT', 'DELAY', 'TAG_CONTACT', 'LINK_LEAD');

-- CreateEnum
CREATE TYPE "SyncWarningLevel" AS ENUM ('INFO', 'WARNING', 'URGENT', 'BLOCK');

-- CreateEnum
CREATE TYPE "ErrorLayer" AS ENUM ('BE', 'FE', 'DB', 'MOB');

-- CreateEnum
CREATE TYPE "ErrorSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "WalletTxnType" AS ENUM ('CREDIT', 'DEBIT', 'REFUND', 'PROMO', 'ADJUSTMENT', 'EXPIRY', 'SUBSCRIPTION_CHARGE');

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('SUBSCRIPTION', 'ONE_TIME', 'USAGE_BASED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('CREATED', 'AUTHENTICATED', 'ACTIVE', 'PAUSED', 'PENDING', 'HALTED', 'CANCELLED', 'COMPLETED', 'EXPIRED', 'TRIALING');

-- CreateEnum
CREATE TYPE "WalletTxnStatus" AS ENUM ('WTX_PENDING', 'WTX_COMPLETED', 'WTX_FAILED', 'WTX_REVERSED');

-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('FIXED_TOKENS', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('TRIAL_EXTENSION', 'DISCOUNT_PERCENTAGE', 'DISCOUNT_FLAT', 'BONUS_TOKENS', 'FREE_UPGRADE');

-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('LIC_ACTIVE', 'LIC_EXPIRED', 'LIC_SUSPENDED', 'LIC_REVOKED');

-- CreateEnum
CREATE TYPE "ModuleCategory" AS ENUM ('CORE', 'CRM', 'SALES', 'FINANCE', 'POST_SALES', 'COMMUNICATION', 'AI', 'REPORTS', 'DEVELOPER', 'WORKFLOW', 'MARKETING', 'OPERATIONS', 'INTEGRATIONS', 'MARKETPLACE', 'ADDON', 'ANALYTICS');

-- CreateEnum
CREATE TYPE "FeatureType" AS ENUM ('PAGE', 'WIDGET', 'REPORT', 'ACTION', 'INTEGRATION');

-- CreateEnum
CREATE TYPE "ModulePricingType" AS ENUM ('FREE', 'INCLUDED', 'ADDON', 'ONE_TIME', 'PER_USAGE');

-- CreateEnum
CREATE TYPE "ModuleStatus" AS ENUM ('ACTIVE', 'BETA', 'DEPRECATED', 'COMING_SOON');

-- CreateEnum
CREATE TYPE "EntityLimitType" AS ENUM ('CONTACTS', 'ORGANIZATIONS', 'LEADS', 'QUOTATIONS', 'INVOICES', 'PRODUCTS', 'USERS', 'FILE_STORAGE_MB', 'DB_SIZE_MB', 'MARKETPLACE_PROMOTIONS', 'EMAIL_PER_MONTH', 'WHATSAPP_PER_MONTH', 'SMS_PER_MONTH', 'API_CALLS_PER_DAY', 'REPORTS_COUNT', 'WORKFLOWS_COUNT', 'CUSTOM_FIELDS_COUNT');

-- CreateEnum
CREATE TYPE "IndustryCategory" AS ENUM ('SERVICES', 'MANUFACTURING', 'RETAIL', 'HEALTHCARE', 'EDUCATION', 'FINANCE', 'REAL_ESTATE', 'FOOD_BEVERAGE', 'TRAVEL', 'CONSTRUCTION', 'ECOMMERCE', 'EVENTS', 'AUTOMOTIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "TenantModuleStatus" AS ENUM ('ACTIVE', 'TRIAL', 'EXPIRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CredentialValidationStatus" AS ENUM ('NOT_SET', 'VALID', 'INVALID');

-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "MarketplaceModuleStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "MarketplaceInstallStatus" AS ENUM ('TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ModuleType" AS ENUM ('AI_PLUGIN', 'INTEGRATION', 'TEMPLATE', 'BUNDLE');

-- CreateEnum
CREATE TYPE "AiHandlerType" AS ENUM ('GENERIC', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ContentRating" AS ENUM ('GENERAL', 'BUSINESS', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('WALLET_DEDUCT', 'RAZORPAY_SUBSCRIPTION', 'TRIAL', 'FREE');

-- CreateEnum
CREATE TYPE "VendorType" AS ENUM ('PLATFORM_OWNER', 'THIRD_PARTY', 'PARTNER');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('PRODUCT', 'SERVICE', 'NEW_LAUNCH', 'LAUNCHING_OFFER', 'REQUIREMENT', 'JOB', 'OTHER');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('LST_DRAFT', 'LST_SCHEDULED', 'LST_ACTIVE', 'LST_EXPIRED', 'LST_SOLD_OUT', 'LST_DEACTIVATED', 'LST_ARCHIVED');

-- CreateEnum
CREATE TYPE "VisibilityType" AS ENUM ('VIS_PUBLIC', 'VIS_GEO_TARGETED', 'VIS_VERIFIED_ONLY', 'VIS_MY_CONTACTS', 'VIS_SELECTED_CONTACTS', 'VIS_CATEGORY_BASED', 'VIS_GRADE_BASED');

-- CreateEnum
CREATE TYPE "ExpiryAction" AS ENUM ('EXP_DEACTIVATE', 'EXP_ARCHIVE', 'EXP_DELETE', 'EXP_NOTIFY_OWNER');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('PT_TEXT', 'PT_IMAGE', 'PT_VIDEO', 'PT_PRODUCT_SHARE', 'PT_JOB_POSTING', 'PT_NEWS', 'PT_ANNOUNCEMENT', 'PT_POLL');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('PS_DRAFT', 'PS_SCHEDULED', 'PS_ACTIVE', 'PS_EXPIRED', 'PS_HIDDEN', 'PS_DELETED');

-- CreateEnum
CREATE TYPE "EngagementAction" AS ENUM ('EA_VIEW', 'EA_LIKE', 'EA_UNLIKE', 'EA_COMMENT', 'EA_REPLY', 'EA_SHARE', 'EA_SAVE', 'EA_UNSAVE', 'EA_CLICK', 'EA_ENQUIRY');

-- CreateEnum
CREATE TYPE "MktOrderStatus" AS ENUM ('MKT_PENDING', 'MKT_CONFIRMED', 'MKT_PROCESSING', 'MKT_SHIPPED', 'MKT_DELIVERED', 'MKT_CANCELLED', 'MKT_RETURNED', 'MKT_REFUNDED');

-- CreateEnum
CREATE TYPE "MktPaymentStatus" AS ENUM ('MPAY_PENDING', 'MPAY_PAID', 'MPAY_FAILED', 'MPAY_REFUNDED', 'MPAY_PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('ENQ_NEW', 'ENQ_RESPONDED', 'ENQ_QUOTED', 'ENQ_NEGOTIATING', 'ENQ_CONVERTED', 'ENQ_CLOSED', 'ENQ_SPAM');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FLAT_INR');

-- CreateEnum
CREATE TYPE "HelpType" AS ENUM ('DEVELOPER', 'USER');

-- CreateEnum
CREATE TYPE "PluginCategory" AS ENUM ('COMMUNICATION', 'PAYMENT', 'CALENDAR', 'TELEPHONY', 'STORAGE', 'AI', 'MARKETING', 'ANALYTICS');

-- CreateEnum
CREATE TYPE "PluginStatus" AS ENUM ('PLUGIN_ACTIVE', 'PLUGIN_INACTIVE', 'PLUGIN_DEPRECATED', 'PLUGIN_BETA');

-- CreateEnum
CREATE TYPE "TenantPluginStatus" AS ENUM ('TP_ACTIVE', 'TP_INACTIVE', 'TP_ERROR', 'TP_PENDING_SETUP');

-- CreateEnum
CREATE TYPE "VersionStatus" AS ENUM ('DRAFT', 'TESTING', 'STAGED', 'PUBLISHED', 'ROLLED_BACK', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "PatchStatus" AS ENUM ('PENDING', 'APPLIED', 'FAILED', 'ROLLED_BACK');

-- CreateEnum
CREATE TYPE "TestEnvSourceType" AS ENUM ('SEED_DATA', 'LIVE_CLONE', 'BACKUP_RESTORE');

-- CreateEnum
CREATE TYPE "TestEnvStatus" AS ENUM ('QUEUED', 'CREATING', 'SEEDING', 'READY', 'TESTING', 'COMPLETED', 'FAILED', 'CLEANING', 'CLEANED');

-- CreateEnum
CREATE TYPE "TestRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TestType" AS ENUM ('UNIT', 'FUNCTIONAL', 'SMOKE', 'INTEGRATION', 'ARCHITECTURE', 'PENETRATION');

-- CreateEnum
CREATE TYPE "TestResultStatus" AS ENUM ('PASS', 'FAIL', 'SKIP', 'ERROR', 'TIMEOUT');

-- CreateEnum
CREATE TYPE "TestGroupStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BackupJobStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "RestoreJobStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "TestPlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TestPlanItemStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'PASSED', 'FAILED', 'PARTIAL', 'BLOCKED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "TestPlanItemPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TestErrorCategory" AS ENUM ('FUNCTIONAL', 'VALIDATION', 'DATABASE', 'UI_RENDER', 'API_CONTRACT', 'ARCHITECTURE', 'SECURITY', 'PERFORMANCE', 'CONFIGURATION', 'OTHER');

-- CreateEnum
CREATE TYPE "TestSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "gv_aud_error_logs" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "error_code" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status_code" INTEGER NOT NULL,
    "layer" "ErrorLayer" NOT NULL DEFAULT 'BE',
    "severity" "ErrorSeverity" NOT NULL DEFAULT 'ERROR',
    "path" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "user_id" TEXT,
    "tenant_id" TEXT,
    "details" JSONB,
    "stack" TEXT,
    "ip" TEXT,
    "user_agent" VARCHAR(500),
    "module" VARCHAR(100),
    "request_body" JSONB,
    "query_params" JSONB,
    "metadata" JSONB,
    "request_headers" JSONB,
    "response_body" JSONB,
    "response_time_ms" INTEGER,
    "user_name" TEXT,
    "user_role" TEXT,
    "tenant_name" TEXT,
    "industry_code" TEXT,
    "is_auto_reported" BOOLEAN NOT NULL DEFAULT false,
    "auto_reported_at" TIMESTAMP(3),
    "auto_reported_to" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reported_to_provider" BOOLEAN NOT NULL DEFAULT false,
    "reported_to_provider_at" TIMESTAMP(3),
    "reported_to_provider_by_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolved_at" TIMESTAMP(3),
    "resolved_by_id" TEXT,
    "resolution" TEXT,
    "assigned_to_id" TEXT,
    "assigned_to_name" TEXT,
    "support_ticket_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_aud_error_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_aud_error_auto_report_rules" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "name" TEXT NOT NULL,
    "severity" "ErrorSeverity" NOT NULL,
    "channels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "email_recipients" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "slack_webhook_url" TEXT,
    "whatsapp_numbers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "throttle_minutes" INTEGER NOT NULL DEFAULT 15,
    "last_triggered_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_aud_error_auto_report_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_aud_tenant_activity_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "details" TEXT,
    "metadata" JSONB,
    "performed_by_id" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_aud_tenant_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_aud_plugin_hook_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "plugin_id" TEXT NOT NULL,
    "hook_point" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "status" TEXT NOT NULL,
    "duration_ms" INTEGER,
    "request_payload" JSONB,
    "response_payload" JSONB,
    "error_message" TEXT,
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_aud_plugin_hook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_marketplace_modules" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "module_code" TEXT NOT NULL,
    "module_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "long_description" TEXT NOT NULL,
    "screenshots" JSONB NOT NULL DEFAULT '[]',
    "demo_video_url" TEXT,
    "documentation_url" TEXT,
    "changelog" JSONB NOT NULL DEFAULT '[]',
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "status" "MarketplaceModuleStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "launch_offer_days" INTEGER,
    "launch_offer_ends" TIMESTAMP(3),
    "pricing_plans" JSONB NOT NULL DEFAULT '[]',
    "usage_limits" JSONB NOT NULL DEFAULT '{}',
    "target_types" JSONB NOT NULL DEFAULT '["ALL"]',
    "install_count" INTEGER NOT NULL DEFAULT 0,
    "avg_rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "module_type" "ModuleType" NOT NULL DEFAULT 'INTEGRATION',
    "capabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ai_task_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ai_handler_key" TEXT,
    "ai_handler_type" "AiHandlerType" NOT NULL DEFAULT 'GENERIC',
    "supported_payment_modes" TEXT[] DEFAULT ARRAY['WALLET_DEDUCT']::TEXT[],
    "min_wallet_balance" DECIMAL(12,2),
    "estimated_tokens_per_call" INTEGER,
    "requires_privacy_mode" BOOLEAN NOT NULL DEFAULT false,
    "provider_support" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "content_rating" "ContentRating" NOT NULL DEFAULT 'GENERAL',
    "marketplace_namespace" TEXT,
    "ai_handler_config" JSONB,

    CONSTRAINT "gv_mkt_marketplace_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_marketplace_reviews" (
    "id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "vendor_response" TEXT,
    "vendor_response_at" TIMESTAMP(3),

    CONSTRAINT "gv_mkt_marketplace_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_tenant_modules" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "plan_id" TEXT,
    "status" "MarketplaceInstallStatus" NOT NULL DEFAULT 'TRIAL',
    "trial_ends_at" TIMESTAMP(3),
    "subscription_id" TEXT,
    "installed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,
    "payment_mode" "PaymentMode" NOT NULL DEFAULT 'TRIAL',
    "wallet_monthly_budget" DECIMAL(12,2),
    "current_month_usage" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "last_usage_reset_at" TIMESTAMP(3),
    "installation_config" JSONB,
    "activated_at" TIMESTAMP(3),
    "last_invoked_at" TIMESTAMP(3),
    "invocation_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "gv_mkt_tenant_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_listings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "listing_type" "ListingType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "short_description" TEXT,
    "category" TEXT,
    "subcategory" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "media_urls" JSONB NOT NULL DEFAULT '[]',
    "b2c_price" DECIMAL(12,2) NOT NULL,
    "compare_at_price" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "b2b_enabled" BOOLEAN NOT NULL DEFAULT false,
    "moq" INTEGER NOT NULL DEFAULT 1,
    "max_qty_per_order" INTEGER,
    "track_inventory" BOOLEAN NOT NULL DEFAULT true,
    "stock_available" INTEGER NOT NULL DEFAULT 0,
    "stock_reserved" INTEGER NOT NULL DEFAULT 0,
    "low_stock_threshold" INTEGER,
    "visibility" "VisibilityType" NOT NULL DEFAULT 'VIS_PUBLIC',
    "visibility_config" JSONB,
    "max_responses" INTEGER,
    "current_responses" INTEGER NOT NULL DEFAULT 0,
    "auto_close_on_limit" BOOLEAN NOT NULL DEFAULT false,
    "status" "ListingStatus" NOT NULL DEFAULT 'LST_DRAFT',
    "publish_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "expiry_action" "ExpiryAction" NOT NULL DEFAULT 'EXP_DEACTIVATE',
    "requirement_config" JSONB,
    "attributes" JSONB NOT NULL DEFAULT '{}',
    "shipping_config" JSONB,
    "slug" TEXT,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "enquiry_count" INTEGER NOT NULL DEFAULT 0,
    "order_count" INTEGER NOT NULL DEFAULT 0,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "featured_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_mkt_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_listing_price_tiers" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "min_qty" INTEGER NOT NULL,
    "max_qty" INTEGER,
    "price_per_unit" DECIMAL(12,2) NOT NULL,
    "customer_grade" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gv_mkt_listing_price_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_posts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "post_type" "PostType" NOT NULL DEFAULT 'PT_TEXT',
    "content" TEXT,
    "media_urls" JSONB NOT NULL DEFAULT '[]',
    "linked_listing_id" TEXT,
    "visibility" "VisibilityType" NOT NULL DEFAULT 'VIS_PUBLIC',
    "visibility_config" JSONB,
    "status" "PostStatus" NOT NULL DEFAULT 'PS_DRAFT',
    "publish_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "expiry_action" "ExpiryAction" NOT NULL DEFAULT 'EXP_DEACTIVATE',
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "share_count" INTEGER NOT NULL DEFAULT 0,
    "save_count" INTEGER NOT NULL DEFAULT 0,
    "hashtags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mentions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "poll_config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

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
    "pincode" TEXT,
    "device_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_mkt_post_engagements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_post_comments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parent_id" TEXT,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_mkt_post_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_enquiries" (
    "id" TEXT NOT NULL,
    "enquiry_number" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "listing_title" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "buyer_name" TEXT NOT NULL,
    "buyer_email" TEXT,
    "buyer_phone" TEXT,
    "buyer_company" TEXT,
    "buyer_verified" BOOLEAN NOT NULL DEFAULT false,
    "quantity" INTEGER,
    "budget" DECIMAL(12,2),
    "timeline" TEXT,
    "message" TEXT,
    "specifications" JSONB,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'ENQ_NEW',
    "messages" JSONB NOT NULL DEFAULT '[]',
    "unread_count_buyer" INTEGER NOT NULL DEFAULT 0,
    "unread_count_vendor" INTEGER NOT NULL DEFAULT 0,
    "last_message_at" TIMESTAMP(3),
    "lead_id" TEXT,
    "lead_created_at" TIMESTAMP(3),
    "quotation_id" TEXT,
    "quoted_price" DECIMAL(12,2),
    "quoted_at" TIMESTAMP(3),
    "converted_to_order_id" TEXT,
    "converted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_mkt_enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_orders" (
    "id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount_code" TEXT,
    "taxable_amount" DECIMAL(12,2) NOT NULL,
    "cgst_amount" DECIMAL(12,2),
    "sgst_amount" DECIMAL(12,2),
    "igst_amount" DECIMAL(12,2),
    "total_tax" DECIMAL(12,2) NOT NULL,
    "shipping_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "status" "MktOrderStatus" NOT NULL DEFAULT 'MKT_PENDING',
    "status_history" JSONB NOT NULL DEFAULT '[]',
    "shipping_address" JSONB NOT NULL,
    "billing_address" JSONB,
    "tracking_number" TEXT,
    "carrier" TEXT,
    "estimated_delivery" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "payment_method" TEXT,
    "payment_status" "MktPaymentStatus" NOT NULL DEFAULT 'MPAY_PENDING',
    "transaction_id" TEXT,
    "paid_at" TIMESTAMP(3),
    "invoice_id" TEXT,
    "source_enquiry_id" TEXT,
    "buyer_notes" TEXT,
    "vendor_notes" TEXT,
    "internal_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_mkt_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sku" TEXT,
    "attributes" JSONB,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "total_price" DECIMAL(12,2) NOT NULL,
    "tax_rate" DECIMAL(5,2),
    "tax_amount" DECIMAL(12,2),
    "applied_tier" TEXT,

    CONSTRAINT "gv_mkt_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_listing_analytics" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "total_views" INTEGER NOT NULL DEFAULT 0,
    "unique_views" INTEGER NOT NULL DEFAULT 0,
    "total_enquiries" INTEGER NOT NULL DEFAULT 0,
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "view_to_enquiry" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "enquiry_to_order" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "daily_stats" JSONB NOT NULL DEFAULT '[]',
    "geo_stats" JSONB NOT NULL DEFAULT '{}',
    "mobile_views" INTEGER NOT NULL DEFAULT 0,
    "desktop_views" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_mkt_listing_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_mkt_post_analytics" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "total_views" INTEGER NOT NULL DEFAULT 0,
    "unique_views" INTEGER NOT NULL DEFAULT 0,
    "total_likes" INTEGER NOT NULL DEFAULT 0,
    "total_comments" INTEGER NOT NULL DEFAULT 0,
    "total_shares" INTEGER NOT NULL DEFAULT 0,
    "total_saves" INTEGER NOT NULL DEFAULT 0,
    "engagement_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "daily_stats" JSONB NOT NULL DEFAULT '[]',
    "geo_stats" JSONB NOT NULL DEFAULT '{}',
    "mobile_views" INTEGER NOT NULL DEFAULT 0,
    "desktop_views" INTEGER NOT NULL DEFAULT 0,
    "top_engagers" JSONB NOT NULL DEFAULT '[]',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_mkt_post_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_master_lookups" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_master_lookups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_lookup_values" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "lookup_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "row_index" INTEGER NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "parent_id" TEXT,
    "config_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_lookup_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_error_catalog" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "layer" "ErrorLayer" NOT NULL DEFAULT 'BE',
    "module" VARCHAR(100) NOT NULL,
    "severity" "ErrorSeverity" NOT NULL DEFAULT 'ERROR',
    "http_status" INTEGER NOT NULL,
    "message_en" TEXT NOT NULL,
    "message_hi" TEXT,
    "solution_en" TEXT,
    "solution_hi" TEXT,
    "technical_info" TEXT,
    "help_url" TEXT,
    "is_retryable" BOOLEAN NOT NULL DEFAULT false,
    "retry_after_ms" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_cfg_error_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_module_definitions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "ModuleCategory" NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "module_status" "ModuleStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_core" BOOLEAN NOT NULL DEFAULT false,
    "icon_name" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "depends_on" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "auto_enables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "features" JSONB NOT NULL DEFAULT '[]',
    "menu_keys" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "applicable_types" JSONB NOT NULL DEFAULT '["ALL"]',
    "source" TEXT NOT NULL DEFAULT 'PLATFORM',
    "vendor_id" TEXT,
    "default_pricing_type" "ModulePricingType" NOT NULL DEFAULT 'INCLUDED',
    "is_free_in_base" BOOLEAN NOT NULL DEFAULT false,
    "base_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "price_monthly" DECIMAL(12,2),
    "price_yearly" DECIMAL(12,2),
    "one_time_setup_fee" DECIMAL(12,2),
    "trial_days" INTEGER NOT NULL DEFAULT 0,
    "trial_features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "usage_pricing" JSONB,
    "requires_credentials" BOOLEAN NOT NULL DEFAULT false,
    "credential_schema" JSONB,
    "industry_code" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_cfg_module_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_business_type_registry" (
    "id" TEXT NOT NULL,
    "type_code" TEXT NOT NULL,
    "type_name" TEXT NOT NULL,
    "industry_category" "IndustryCategory" NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color_theme" TEXT,
    "terminology_map" JSONB NOT NULL DEFAULT '{}',
    "default_modules" JSONB NOT NULL DEFAULT '[]',
    "recommended_modules" JSONB NOT NULL DEFAULT '[]',
    "excluded_modules" JSONB NOT NULL DEFAULT '[]',
    "workflow_templates" JSONB NOT NULL DEFAULT '[]',
    "dashboard_widgets" JSONB NOT NULL DEFAULT '[]',
    "extra_fields" JSONB NOT NULL DEFAULT '{}',
    "default_lead_stages" JSONB,
    "default_activity_types" JSONB,
    "registration_fields" JSONB,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_script" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_cfg_business_type_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_industry_packages" (
    "id" TEXT NOT NULL,
    "industry_id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "is_recommended" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "gv_cfg_industry_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_tenant_modules" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "status" "TenantModuleStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_trial" BOOLEAN NOT NULL DEFAULT false,
    "enabled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trial_ends_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "enabled_features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "current_usage" JSONB,
    "credentials_enc" TEXT,
    "credentials_validated_at" TIMESTAMP(3),
    "credentials_status" "CredentialValidationStatus" NOT NULL DEFAULT 'NOT_SET',
    "enabled_by" TEXT NOT NULL DEFAULT '',
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_tenant_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_doc_help_articles" (
    "id" TEXT NOT NULL,
    "article_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "help_type" "HelpType" NOT NULL,
    "module_code" TEXT,
    "screen_code" TEXT,
    "field_code" TEXT,
    "applicable_types" JSONB NOT NULL DEFAULT '["ALL"]',
    "uses_terminology" BOOLEAN NOT NULL DEFAULT false,
    "video_url" TEXT,
    "video_thumbnail" TEXT,
    "related_articles" JSONB NOT NULL DEFAULT '[]',
    "visible_to_roles" JSONB NOT NULL DEFAULT '["ALL"]',
    "tags" JSONB NOT NULL DEFAULT '[]',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "not_helpful_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_doc_help_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_plugin_registry" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "PluginCategory" NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "status" "PluginStatus" NOT NULL DEFAULT 'PLUGIN_ACTIVE',
    "config_schema" JSONB NOT NULL,
    "hook_points" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "menu_codes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "oauth_config" JSONB,
    "webhook_config" JSONB,
    "icon_url" TEXT,
    "setup_guide_url" TEXT,
    "api_docs_url" TEXT,
    "industry_code" TEXT,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "monthly_price" DECIMAL(10,2),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_cfg_plugin_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_tenant_plugins" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "plugin_id" TEXT NOT NULL,
    "status" "TenantPluginStatus" NOT NULL DEFAULT 'TP_PENDING_SETUP',
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "enabled_at" TIMESTAMP(3),
    "disabled_at" TIMESTAMP(3),
    "credentials" TEXT,
    "settings" JSONB,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "token_scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "webhook_url" TEXT,
    "webhook_secret" TEXT,
    "last_used_at" TIMESTAMP(3),
    "last_sync_at" TIMESTAMP(3),
    "last_error_at" TIMESTAMP(3),
    "last_error" TEXT,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "consecutive_errors" INTEGER NOT NULL DEFAULT 0,
    "monthly_usage" INTEGER NOT NULL DEFAULT 0,
    "monthly_limit" INTEGER,
    "usage_reset_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_id" TEXT,
    "updated_by_id" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,

    CONSTRAINT "gv_cfg_tenant_plugins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_page_registry" (
    "id" TEXT NOT NULL,
    "route_path" TEXT NOT NULL,
    "route_pattern" TEXT NOT NULL,
    "portal" TEXT NOT NULL DEFAULT 'crm',
    "file_path" TEXT NOT NULL,
    "component_name" TEXT,
    "friendly_name" TEXT,
    "description" TEXT,
    "page_type" TEXT,
    "category" TEXT,
    "module_code" TEXT,
    "menu_key" TEXT,
    "menu_label" TEXT,
    "menu_icon" TEXT,
    "menu_parent_key" TEXT,
    "menu_sort_order" INTEGER NOT NULL DEFAULT 0,
    "show_in_menu" BOOLEAN NOT NULL DEFAULT true,
    "has_params" BOOLEAN NOT NULL DEFAULT false,
    "param_names" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_nested" BOOLEAN NOT NULL DEFAULT false,
    "parent_route" TEXT,
    "features_covered" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "api_endpoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "screenshot_url" TEXT,
    "preview_url" TEXT,
    "industry_code" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_auto_discovered" BOOLEAN NOT NULL DEFAULT true,
    "last_scanned_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_cfg_page_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_app_versions" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "code_name" TEXT,
    "release_type" TEXT NOT NULL DEFAULT 'MINOR',
    "status" "VersionStatus" NOT NULL DEFAULT 'DRAFT',
    "changelog" JSONB NOT NULL DEFAULT '[]',
    "breaking_changes" JSONB NOT NULL DEFAULT '[]',
    "migration_notes" TEXT,
    "modules_updated" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "schema_changes" JSONB,
    "git_tag" TEXT,
    "git_branch" TEXT,
    "git_commit_hash" TEXT,
    "deployed_at" TIMESTAMP(3),
    "deployed_by" TEXT,
    "rollback_at" TIMESTAMP(3),
    "rollback_reason" TEXT,
    "notion_page_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_cfg_app_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_industry_patches" (
    "id" TEXT NOT NULL,
    "version_id" TEXT NOT NULL,
    "industry_code" TEXT NOT NULL,
    "patch_name" TEXT NOT NULL,
    "description" TEXT,
    "status" "PatchStatus" NOT NULL DEFAULT 'PENDING',
    "schema_changes" JSONB,
    "seed_data" JSONB,
    "config_overrides" JSONB,
    "menu_overrides" JSONB,
    "applied_at" TIMESTAMP(3),
    "applied_by" TEXT,
    "error_log" TEXT,
    "rollback_data" JSONB,
    "force_update" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_cfg_industry_patches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_db_backup_records" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "db_name" TEXT NOT NULL,
    "backup_url" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "table_count" INTEGER,
    "row_count" BIGINT,
    "is_validated" BOOLEAN NOT NULL DEFAULT false,
    "validated_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gv_cfg_db_backup_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_backup_logs" (
    "id" TEXT NOT NULL,
    "schema_name" TEXT NOT NULL,
    "db_name" TEXT NOT NULL,
    "r2_key" TEXT,
    "r2_url" TEXT,
    "size_bytes" BIGINT,
    "checksum" TEXT,
    "status" "BackupJobStatus" NOT NULL DEFAULT 'RUNNING',
    "error_message" TEXT,
    "triggered_by" TEXT NOT NULL DEFAULT 'cron',
    "duration_ms" INTEGER,
    "retention_days" INTEGER NOT NULL DEFAULT 30,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gv_cfg_backup_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_restore_logs" (
    "id" TEXT NOT NULL,
    "backup_log_id" TEXT,
    "schema_name" TEXT NOT NULL,
    "db_name" TEXT NOT NULL,
    "r2_key" TEXT,
    "status" "RestoreJobStatus" NOT NULL DEFAULT 'RUNNING',
    "error_message" TEXT,
    "triggered_by" TEXT NOT NULL,
    "duration_ms" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gv_cfg_restore_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_system_field_master" (
    "id" TEXT NOT NULL,
    "field_code" TEXT NOT NULL,
    "field_group" TEXT NOT NULL,
    "field_type" TEXT NOT NULL,
    "field_value" TEXT NOT NULL,
    "default_value" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "min_value" TEXT,
    "max_value" TEXT,
    "options" JSONB,
    "scope" TEXT NOT NULL DEFAULT 'PLATFORM',
    "tenant_id" TEXT,
    "is_editable" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" TEXT,
    "updated_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_cfg_system_field_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_vertical" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "table_prefix" VARCHAR(10) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_built" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_cfg_vertical_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_vertical_module" (
    "id" TEXT NOT NULL,
    "vertical_id" TEXT NOT NULL,
    "module_code" VARCHAR(6) NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gv_cfg_vertical_module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_lic_packages" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_lic_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_lic_tenant_usage_details" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "resource_key" TEXT NOT NULL,
    "current_count" INTEGER NOT NULL DEFAULT 0,
    "monthly_count" INTEGER NOT NULL DEFAULT 0,
    "month_year" TEXT,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_lic_tenant_usage_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_pay_wallets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "promo_balance" INTEGER NOT NULL DEFAULT 0,
    "lifetime_credit" INTEGER NOT NULL DEFAULT 0,
    "lifetime_debit" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "token_rate" INTEGER NOT NULL DEFAULT 100,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_pay_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_pay_wallet_transactions" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "type" "WalletTxnType" NOT NULL,
    "status" "WalletTxnStatus" NOT NULL DEFAULT 'WTX_COMPLETED',
    "tokens" INTEGER NOT NULL,
    "balance_before" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "service_key" TEXT,
    "metadata" JSONB,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_pay_wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_pay_recharge_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "tokens" INTEGER NOT NULL,
    "bonus_tokens" INTEGER NOT NULL DEFAULT 0,
    "industry_code" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_pay_recharge_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_lic_coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "CouponType" NOT NULL,
    "value" INTEGER NOT NULL,
    "max_uses" INTEGER NOT NULL DEFAULT 1,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "min_recharge" DECIMAL(12,2),
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "industry_code" TEXT,
    "description" TEXT,
    "discount_type" "DiscountType",
    "discount_value" DECIMAL(12,2),
    "max_discount_inr" DECIMAL(12,2),
    "applicable_packages" JSONB NOT NULL DEFAULT '["ALL"]',
    "applicable_types" JSONB NOT NULL DEFAULT '["ALL"]',
    "valid_from" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),
    "per_user_limit" INTEGER NOT NULL DEFAULT 1,
    "first_time_only" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT,
    "package_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_lic_coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soft_lic_software_offers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "offer_type" "OfferType" NOT NULL,
    "value" INTEGER NOT NULL,
    "applicable_plan_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3) NOT NULL,
    "max_redemptions" INTEGER NOT NULL DEFAULT 0,
    "current_redemptions" INTEGER NOT NULL DEFAULT 0,
    "industry_code" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "auto_apply" BOOLEAN NOT NULL DEFAULT false,
    "terms" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soft_lic_software_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_lic_license_keys" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "license_key" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" "LicenseStatus" NOT NULL DEFAULT 'LIC_ACTIVE',
    "activated_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "max_users" INTEGER NOT NULL DEFAULT 5,
    "allowed_modules" JSONB,
    "hardware_fingerprint" TEXT,
    "last_validated_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_lic_license_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soft_lic_ai_plans" (
    "id" TEXT NOT NULL,
    "plan_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "razorpay_plan_id" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "interval" "BillingInterval" NOT NULL,
    "interval_count" INTEGER NOT NULL DEFAULT 1,
    "tokens_per_cycle" INTEGER NOT NULL DEFAULT 0,
    "bonus_tokens_per_cycle" INTEGER NOT NULL DEFAULT 0,
    "features" JSONB DEFAULT '[]',
    "trial_days" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "plan_type" "PlanType" NOT NULL DEFAULT 'SUBSCRIPTION',
    "marketplace_module_id" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "soft_lic_ai_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soft_lic_ai_subscriptions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "razorpay_subscription_id" TEXT,
    "razorpay_plan_id" TEXT,
    "razorpay_customer_id" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'CREATED',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "current_period_start" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "next_billing_at" TIMESTAMP(3),
    "trial_start" TIMESTAMP(3),
    "trial_end" TIMESTAMP(3),
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "cancelled_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,
    "total_cycles" INTEGER,
    "completed_cycles" INTEGER NOT NULL DEFAULT 0,
    "failed_payments" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB DEFAULT '{}',
    "notes" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "soft_lic_ai_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soft_lic_ai_subscription_items" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "item_type" TEXT NOT NULL,
    "item_ref_id" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_amount" DECIMAL(12,2) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soft_lic_ai_subscription_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_lic_subscription_packages" (
    "id" TEXT NOT NULL,
    "package_code" TEXT NOT NULL,
    "package_name" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "tier" INTEGER NOT NULL DEFAULT 0,
    "price_monthly_inr" DECIMAL(12,2) NOT NULL,
    "quarterly_price" DECIMAL(12,2),
    "price_yearly_inr" DECIMAL(12,2) NOT NULL,
    "yearly_discount_pct" DECIMAL(5,2) NOT NULL DEFAULT 20,
    "one_time_setup_fee" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "trial_days" INTEGER NOT NULL DEFAULT 14,
    "entity_limits" JSONB NOT NULL DEFAULT '{}',
    "applicable_types" JSONB NOT NULL DEFAULT '["ALL"]',
    "included_modules" JSONB NOT NULL DEFAULT '[]',
    "limits" JSONB NOT NULL DEFAULT '{}',
    "intro_offer_json" JSONB,
    "feature_flags" JSONB NOT NULL DEFAULT '{}',
    "plan_level" INTEGER NOT NULL DEFAULT 0,
    "has_dedicated_db" BOOLEAN NOT NULL DEFAULT false,
    "max_db_size_mb" INTEGER,
    "industry_code" TEXT,
    "is_popular" BOOLEAN NOT NULL DEFAULT false,
    "badge_text" TEXT,
    "color" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_lic_subscription_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_lic_coupon_redemptions" (
    "id" TEXT NOT NULL,
    "coupon_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "discount_applied" DECIMAL(12,2) NOT NULL,
    "redeemed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_lic_coupon_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_lic_package_modules" (
    "id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "pricingType" "ModulePricingType" NOT NULL DEFAULT 'INCLUDED',
    "addon_price" DECIMAL(12,2),
    "one_time_fee" DECIMAL(12,2),
    "enabled_features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "disabled_features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "trial_allowed" BOOLEAN NOT NULL DEFAULT true,
    "trial_days" INTEGER,
    "module_limits" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_lic_package_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_qa_environments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "source_type" "TestEnvSourceType" NOT NULL,
    "source_db_url" TEXT,
    "backup_id" TEXT,
    "test_db_name" TEXT NOT NULL,
    "test_db_url" TEXT,
    "status" "TestEnvStatus" NOT NULL DEFAULT 'QUEUED',
    "status_message" TEXT,
    "progress_percent" INTEGER NOT NULL DEFAULT 0,
    "db_size_bytes" BIGINT,
    "tables_created" INTEGER,
    "seed_records" INTEGER,
    "ttl_hours" INTEGER NOT NULL DEFAULT 24,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3),
    "cleaned_at" TIMESTAMP(3),
    "error_message" TEXT,
    "error_stack" TEXT,

    CONSTRAINT "gv_qa_environments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_qa_runs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "test_env_id" TEXT,
    "run_type" TEXT NOT NULL,
    "test_types" TEXT[],
    "target_modules" TEXT[],
    "status" "TestRunStatus" NOT NULL DEFAULT 'QUEUED',
    "progress_percent" INTEGER NOT NULL DEFAULT 0,
    "current_phase" TEXT,
    "total_tests" INTEGER NOT NULL DEFAULT 0,
    "passed" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "skipped" INTEGER NOT NULL DEFAULT 0,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "summary" JSONB NOT NULL DEFAULT '{}',
    "coverage_percent" DOUBLE PRECISION,
    "coverage_report" JSONB,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" TEXT NOT NULL,

    CONSTRAINT "gv_qa_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_qa_results" (
    "id" TEXT NOT NULL,
    "test_run_id" TEXT NOT NULL,
    "test_type" "TestType" NOT NULL,
    "suite_name" TEXT NOT NULL,
    "test_name" TEXT NOT NULL,
    "file_path" TEXT,
    "module" TEXT,
    "status" "TestResultStatus" NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "error_stack" TEXT,
    "expected_value" TEXT,
    "actual_value" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gv_qa_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_qa_groups" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_hi" TEXT,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "modules" TEXT[],
    "steps" JSONB NOT NULL DEFAULT '[]',
    "status" "TestGroupStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "estimated_duration" INTEGER,
    "run_count" INTEGER NOT NULL DEFAULT 0,
    "last_run_at" TIMESTAMP(3),
    "last_run_status" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_id" TEXT NOT NULL,

    CONSTRAINT "gv_qa_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_qa_group_executions" (
    "id" TEXT NOT NULL,
    "test_group_id" TEXT NOT NULL,
    "test_run_id" TEXT,
    "test_env_id" TEXT,
    "tenant_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "current_step" INTEGER NOT NULL DEFAULT 0,
    "total_steps" INTEGER NOT NULL,
    "step_results" JSONB NOT NULL DEFAULT '[]',
    "total_passed" INTEGER NOT NULL DEFAULT 0,
    "total_failed" INTEGER NOT NULL DEFAULT 0,
    "total_errors" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "executed_by_id" TEXT NOT NULL,

    CONSTRAINT "gv_qa_group_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_qa_manual_logs" (
    "id" TEXT NOT NULL,
    "test_run_id" TEXT,
    "test_group_id" TEXT,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "page_name" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "expected_result" TEXT NOT NULL,
    "actual_result" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PASS',
    "severity" TEXT,
    "screenshot_urls" JSONB NOT NULL DEFAULT '[]',
    "video_url" TEXT,
    "notes" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "screen_resolution" TEXT,
    "bug_reported" BOOLEAN NOT NULL DEFAULT false,
    "bug_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_qa_manual_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_qa_scheduled_tests" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cron_expression" TEXT NOT NULL,
    "target_modules" TEXT[],
    "test_types" TEXT[],
    "db_source_type" "TestEnvSourceType" NOT NULL DEFAULT 'BACKUP_RESTORE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_run_at" TIMESTAMP(3),
    "next_run_at" TIMESTAMP(3),
    "last_run_status" "TestRunStatus",
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_id" TEXT NOT NULL,

    CONSTRAINT "gv_qa_scheduled_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_qa_scheduled_runs" (
    "id" TEXT NOT NULL,
    "scheduled_test_id" TEXT NOT NULL,
    "test_run_id" TEXT,
    "backup_record_id" TEXT,
    "test_env_id" TEXT,
    "status" "TestRunStatus" NOT NULL,
    "error_message" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "gv_qa_scheduled_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_qa_plans" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT,
    "target_modules" TEXT[],
    "status" "TestPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "total_items" INTEGER NOT NULL DEFAULT 0,
    "passed_items" INTEGER NOT NULL DEFAULT 0,
    "failed_items" INTEGER NOT NULL DEFAULT 0,
    "completed_items" INTEGER NOT NULL DEFAULT 0,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notion_page_id" TEXT,
    "notion_synced_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_qa_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_qa_plan_items" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "module_name" TEXT NOT NULL,
    "component_name" TEXT NOT NULL,
    "functionality" TEXT NOT NULL,
    "layer" TEXT NOT NULL,
    "priority" "TestPlanItemPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TestPlanItemStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "tested_by_id" TEXT,
    "tested_at" TIMESTAMP(3),
    "notes" TEXT,
    "error_details" TEXT,
    "notion_block_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_qa_plan_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_qa_evidences" (
    "id" TEXT NOT NULL,
    "plan_item_id" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "caption" TEXT,
    "uploaded_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gv_qa_evidences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_qa_error_logs" (
    "id" TEXT NOT NULL,
    "test_run_id" TEXT NOT NULL,
    "test_result_id" TEXT,
    "error_category" "TestErrorCategory" NOT NULL,
    "severity" "TestSeverity" NOT NULL DEFAULT 'MEDIUM',
    "error_code" TEXT,
    "message" TEXT NOT NULL,
    "details" TEXT,
    "stack_trace" TEXT,
    "module_name" TEXT,
    "component_name" TEXT,
    "file_path" TEXT,
    "is_reportable" BOOLEAN NOT NULL DEFAULT false,
    "reported_to_vendor" BOOLEAN NOT NULL DEFAULT false,
    "reported_at" TIMESTAMP(3),
    "vendor_response" TEXT,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gv_qa_error_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_qa_reports" (
    "id" TEXT NOT NULL,
    "test_run_id" TEXT NOT NULL,
    "summary" JSONB NOT NULL DEFAULT '{}',
    "category_results" JSONB NOT NULL DEFAULT '{}',
    "module_results" JSONB NOT NULL DEFAULT '{}',
    "error_summary" JSONB NOT NULL DEFAULT '{}',
    "recommendations" JSONB,
    "report_file_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gv_qa_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_ven_marketplace_vendors" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "contact_name" TEXT,
    "contact_email" TEXT NOT NULL,
    "password" TEXT,
    "gst_number" TEXT,
    "bank_account_enc" TEXT,
    "revenue_share_pct" DECIMAL(5,2) NOT NULL DEFAULT 70,
    "status" "VendorStatus" NOT NULL DEFAULT 'PENDING',
    "verified_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "vendor_type" "VendorType" NOT NULL DEFAULT 'PLATFORM_OWNER',
    "ai_plugin_count" INTEGER NOT NULL DEFAULT 0,
    "support_email" TEXT,
    "website_url" TEXT,

    CONSTRAINT "gv_ven_marketplace_vendors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gv_aud_error_logs_is_deleted_idx" ON "gv_aud_error_logs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_aud_error_logs_error_code_created_at_idx" ON "gv_aud_error_logs"("error_code", "created_at");

-- CreateIndex
CREATE INDEX "gv_aud_error_logs_tenant_id_created_at_idx" ON "gv_aud_error_logs"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "gv_aud_error_logs_request_id_idx" ON "gv_aud_error_logs"("request_id");

-- CreateIndex
CREATE INDEX "gv_aud_error_logs_layer_severity_created_at_idx" ON "gv_aud_error_logs"("layer", "severity", "created_at");

-- CreateIndex
CREATE INDEX "gv_aud_error_logs_created_at_idx" ON "gv_aud_error_logs"("created_at");

-- CreateIndex
CREATE INDEX "gv_aud_error_logs_status_severity_idx" ON "gv_aud_error_logs"("status", "severity");

-- CreateIndex
CREATE INDEX "gv_aud_error_auto_report_rules_is_deleted_idx" ON "gv_aud_error_auto_report_rules"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_aud_error_auto_report_rules_tenant_id_idx" ON "gv_aud_error_auto_report_rules"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_aud_tenant_activity_logs_is_deleted_idx" ON "gv_aud_tenant_activity_logs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_aud_tenant_activity_logs_tenant_id_created_at_idx" ON "gv_aud_tenant_activity_logs"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "gv_aud_tenant_activity_logs_tenant_id_category_idx" ON "gv_aud_tenant_activity_logs"("tenant_id", "category");

-- CreateIndex
CREATE INDEX "gv_aud_plugin_hook_logs_is_deleted_idx" ON "gv_aud_plugin_hook_logs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_aud_plugin_hook_logs_tenant_id_hook_point_executed_at_idx" ON "gv_aud_plugin_hook_logs"("tenant_id", "hook_point", "executed_at");

-- CreateIndex
CREATE INDEX "gv_aud_plugin_hook_logs_tenant_id_plugin_id_executed_at_idx" ON "gv_aud_plugin_hook_logs"("tenant_id", "plugin_id", "executed_at");

-- CreateIndex
CREATE UNIQUE INDEX "gv_mkt_marketplace_modules_module_code_key" ON "gv_mkt_marketplace_modules"("module_code");

-- CreateIndex
CREATE INDEX "gv_mkt_marketplace_modules_marketplace_namespace_idx" ON "gv_mkt_marketplace_modules"("marketplace_namespace");

-- CreateIndex
CREATE INDEX "gv_mkt_marketplace_modules_marketplace_namespace_module_typ_idx" ON "gv_mkt_marketplace_modules"("marketplace_namespace", "module_type");

-- CreateIndex
CREATE INDEX "gv_mkt_marketplace_reviews_is_deleted_idx" ON "gv_mkt_marketplace_reviews"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_mkt_marketplace_reviews_module_id_idx" ON "gv_mkt_marketplace_reviews"("module_id");

-- CreateIndex
CREATE INDEX "gv_mkt_marketplace_reviews_tenant_id_idx" ON "gv_mkt_marketplace_reviews"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_mkt_marketplace_reviews_module_id_tenant_id_key" ON "gv_mkt_marketplace_reviews"("module_id", "tenant_id");

-- CreateIndex
CREATE INDEX "gv_mkt_tenant_modules_is_deleted_idx" ON "gv_mkt_tenant_modules"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_mkt_tenant_modules_tenant_id_idx" ON "gv_mkt_tenant_modules"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_mkt_tenant_modules_tenant_id_module_id_key" ON "gv_mkt_tenant_modules"("tenant_id", "module_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_mkt_listings_slug_key" ON "gv_mkt_listings"("slug");

-- CreateIndex
CREATE INDEX "gv_mkt_listings_is_deleted_idx" ON "gv_mkt_listings"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_mkt_listings_tenant_id_status_idx" ON "gv_mkt_listings"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "gv_mkt_listings_vendor_id_idx" ON "gv_mkt_listings"("vendor_id");

-- CreateIndex
CREATE INDEX "gv_mkt_listings_listing_type_status_idx" ON "gv_mkt_listings"("listing_type", "status");

-- CreateIndex
CREATE INDEX "gv_mkt_listings_category_subcategory_idx" ON "gv_mkt_listings"("category", "subcategory");

-- CreateIndex
CREATE INDEX "gv_mkt_listings_status_publish_at_idx" ON "gv_mkt_listings"("status", "publish_at");

-- CreateIndex
CREATE INDEX "gv_mkt_listings_status_expires_at_idx" ON "gv_mkt_listings"("status", "expires_at");

-- CreateIndex
CREATE INDEX "gv_mkt_listing_price_tiers_listing_id_idx" ON "gv_mkt_listing_price_tiers"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_mkt_listing_price_tiers_listing_id_min_qty_customer_grad_key" ON "gv_mkt_listing_price_tiers"("listing_id", "min_qty", "customer_grade");

-- CreateIndex
CREATE INDEX "gv_mkt_posts_is_deleted_idx" ON "gv_mkt_posts"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_mkt_posts_tenant_id_status_created_at_idx" ON "gv_mkt_posts"("tenant_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "gv_mkt_posts_author_id_idx" ON "gv_mkt_posts"("author_id");

-- CreateIndex
CREATE INDEX "gv_mkt_posts_status_publish_at_idx" ON "gv_mkt_posts"("status", "publish_at");

-- CreateIndex
CREATE INDEX "gv_mkt_posts_status_expires_at_idx" ON "gv_mkt_posts"("status", "expires_at");

-- CreateIndex
CREATE INDEX "gv_mkt_post_engagements_is_deleted_idx" ON "gv_mkt_post_engagements"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_mkt_post_engagements_post_id_action_idx" ON "gv_mkt_post_engagements"("post_id", "action");

-- CreateIndex
CREATE INDEX "gv_mkt_post_engagements_tenant_id_created_at_idx" ON "gv_mkt_post_engagements"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "gv_mkt_post_engagements_user_id_idx" ON "gv_mkt_post_engagements"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_mkt_post_engagements_post_id_user_id_action_key" ON "gv_mkt_post_engagements"("post_id", "user_id", "action");

-- CreateIndex
CREATE INDEX "gv_mkt_post_comments_post_id_created_at_idx" ON "gv_mkt_post_comments"("post_id", "created_at");

-- CreateIndex
CREATE INDEX "gv_mkt_post_comments_user_id_idx" ON "gv_mkt_post_comments"("user_id");

-- CreateIndex
CREATE INDEX "gv_mkt_post_comments_parent_id_idx" ON "gv_mkt_post_comments"("parent_id");

-- CreateIndex
CREATE INDEX "gv_mkt_post_comments_tenant_id_idx" ON "gv_mkt_post_comments"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_mkt_enquiries_enquiry_number_key" ON "gv_mkt_enquiries"("enquiry_number");

-- CreateIndex
CREATE INDEX "gv_mkt_enquiries_is_deleted_idx" ON "gv_mkt_enquiries"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_mkt_enquiries_tenant_id_status_idx" ON "gv_mkt_enquiries"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "gv_mkt_enquiries_vendor_id_status_idx" ON "gv_mkt_enquiries"("vendor_id", "status");

-- CreateIndex
CREATE INDEX "gv_mkt_enquiries_buyer_id_idx" ON "gv_mkt_enquiries"("buyer_id");

-- CreateIndex
CREATE INDEX "gv_mkt_enquiries_listing_id_idx" ON "gv_mkt_enquiries"("listing_id");

-- CreateIndex
CREATE INDEX "gv_mkt_enquiries_lead_id_idx" ON "gv_mkt_enquiries"("lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_mkt_orders_order_number_key" ON "gv_mkt_orders"("order_number");

-- CreateIndex
CREATE INDEX "gv_mkt_orders_is_deleted_idx" ON "gv_mkt_orders"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_mkt_orders_tenant_id_status_idx" ON "gv_mkt_orders"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "gv_mkt_orders_vendor_id_status_idx" ON "gv_mkt_orders"("vendor_id", "status");

-- CreateIndex
CREATE INDEX "gv_mkt_orders_buyer_id_idx" ON "gv_mkt_orders"("buyer_id");

-- CreateIndex
CREATE INDEX "gv_mkt_orders_order_number_idx" ON "gv_mkt_orders"("order_number");

-- CreateIndex
CREATE INDEX "gv_mkt_orders_created_at_idx" ON "gv_mkt_orders"("created_at");

-- CreateIndex
CREATE INDEX "gv_mkt_order_items_order_id_idx" ON "gv_mkt_order_items"("order_id");

-- CreateIndex
CREATE INDEX "gv_mkt_order_items_listing_id_idx" ON "gv_mkt_order_items"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_mkt_listing_analytics_listing_id_key" ON "gv_mkt_listing_analytics"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_mkt_post_analytics_post_id_key" ON "gv_mkt_post_analytics"("post_id");

-- CreateIndex
CREATE INDEX "gv_cfg_master_lookups_is_deleted_idx" ON "gv_cfg_master_lookups"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_master_lookups_tenant_id_idx" ON "gv_cfg_master_lookups"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_master_lookups_tenant_id_category_key" ON "gv_cfg_master_lookups"("tenant_id", "category");

-- CreateIndex
CREATE INDEX "gv_cfg_lookup_values_is_deleted_idx" ON "gv_cfg_lookup_values"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_lookup_values_tenant_id_idx" ON "gv_cfg_lookup_values"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_lookup_values_tenant_id_lookup_id_value_key" ON "gv_cfg_lookup_values"("tenant_id", "lookup_id", "value");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_error_catalog_code_key" ON "gv_cfg_error_catalog"("code");

-- CreateIndex
CREATE INDEX "gv_cfg_error_catalog_layer_module_idx" ON "gv_cfg_error_catalog"("layer", "module");

-- CreateIndex
CREATE INDEX "gv_cfg_error_catalog_severity_idx" ON "gv_cfg_error_catalog"("severity");

-- CreateIndex
CREATE INDEX "gv_cfg_error_catalog_http_status_idx" ON "gv_cfg_error_catalog"("http_status");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_module_definitions_code_key" ON "gv_cfg_module_definitions"("code");

-- CreateIndex
CREATE INDEX "gv_cfg_module_definitions_category_module_status_idx" ON "gv_cfg_module_definitions"("category", "module_status");

-- CreateIndex
CREATE INDEX "gv_cfg_module_definitions_industry_code_idx" ON "gv_cfg_module_definitions"("industry_code");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_business_type_registry_type_code_key" ON "gv_cfg_business_type_registry"("type_code");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_industry_packages_industry_id_package_id_key" ON "gv_cfg_industry_packages"("industry_id", "package_id");

-- CreateIndex
CREATE INDEX "gv_cfg_tenant_modules_is_deleted_idx" ON "gv_cfg_tenant_modules"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_tenant_modules_tenant_id_is_enabled_idx" ON "gv_cfg_tenant_modules"("tenant_id", "is_enabled");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_tenant_modules_tenant_id_module_id_key" ON "gv_cfg_tenant_modules"("tenant_id", "module_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_doc_help_articles_article_code_key" ON "gv_doc_help_articles"("article_code");

-- CreateIndex
CREATE INDEX "gv_doc_help_articles_module_code_screen_code_field_code_idx" ON "gv_doc_help_articles"("module_code", "screen_code", "field_code");

-- CreateIndex
CREATE INDEX "gv_doc_help_articles_help_type_is_published_idx" ON "gv_doc_help_articles"("help_type", "is_published");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_plugin_registry_code_key" ON "gv_cfg_plugin_registry"("code");

-- CreateIndex
CREATE INDEX "gv_cfg_plugin_registry_category_status_industry_code_idx" ON "gv_cfg_plugin_registry"("category", "status", "industry_code");

-- CreateIndex
CREATE INDEX "gv_cfg_tenant_plugins_is_deleted_idx" ON "gv_cfg_tenant_plugins"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_tenant_plugins_tenant_id_status_idx" ON "gv_cfg_tenant_plugins"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "gv_cfg_tenant_plugins_plugin_id_idx" ON "gv_cfg_tenant_plugins"("plugin_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_tenant_plugins_tenant_id_plugin_id_key" ON "gv_cfg_tenant_plugins"("tenant_id", "plugin_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_page_registry_route_path_key" ON "gv_cfg_page_registry"("route_path");

-- CreateIndex
CREATE INDEX "gv_cfg_page_registry_portal_idx" ON "gv_cfg_page_registry"("portal");

-- CreateIndex
CREATE INDEX "gv_cfg_page_registry_module_code_idx" ON "gv_cfg_page_registry"("module_code");

-- CreateIndex
CREATE INDEX "gv_cfg_page_registry_category_idx" ON "gv_cfg_page_registry"("category");

-- CreateIndex
CREATE INDEX "gv_cfg_page_registry_page_type_idx" ON "gv_cfg_page_registry"("page_type");

-- CreateIndex
CREATE INDEX "gv_cfg_page_registry_industry_code_idx" ON "gv_cfg_page_registry"("industry_code");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_app_versions_version_key" ON "gv_cfg_app_versions"("version");

-- CreateIndex
CREATE INDEX "gv_cfg_app_versions_status_idx" ON "gv_cfg_app_versions"("status");

-- CreateIndex
CREATE INDEX "gv_cfg_app_versions_release_type_idx" ON "gv_cfg_app_versions"("release_type");

-- CreateIndex
CREATE INDEX "gv_cfg_industry_patches_industry_code_idx" ON "gv_cfg_industry_patches"("industry_code");

-- CreateIndex
CREATE INDEX "gv_cfg_industry_patches_status_idx" ON "gv_cfg_industry_patches"("status");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_industry_patches_version_id_industry_code_patch_name_key" ON "gv_cfg_industry_patches"("version_id", "industry_code", "patch_name");

-- CreateIndex
CREATE INDEX "gv_cfg_db_backup_records_tenant_id_idx" ON "gv_cfg_db_backup_records"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cfg_db_backup_records_tenant_id_is_validated_idx" ON "gv_cfg_db_backup_records"("tenant_id", "is_validated");

-- CreateIndex
CREATE INDEX "gv_cfg_db_backup_records_tenant_id_created_at_idx" ON "gv_cfg_db_backup_records"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "gv_cfg_backup_logs_schema_name_created_at_idx" ON "gv_cfg_backup_logs"("schema_name", "created_at");

-- CreateIndex
CREATE INDEX "gv_cfg_backup_logs_status_idx" ON "gv_cfg_backup_logs"("status");

-- CreateIndex
CREATE INDEX "gv_cfg_restore_logs_schema_name_created_at_idx" ON "gv_cfg_restore_logs"("schema_name", "created_at");

-- CreateIndex
CREATE INDEX "gv_cfg_restore_logs_status_idx" ON "gv_cfg_restore_logs"("status");

-- CreateIndex
CREATE INDEX "gv_cfg_system_field_master_field_group_idx" ON "gv_cfg_system_field_master"("field_group");

-- CreateIndex
CREATE INDEX "gv_cfg_system_field_master_tenant_id_field_code_idx" ON "gv_cfg_system_field_master"("tenant_id", "field_code");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_system_field_master_field_code_tenant_id_key" ON "gv_cfg_system_field_master"("field_code", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_vertical_code_key" ON "gv_cfg_vertical"("code");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_vertical_table_prefix_key" ON "gv_cfg_vertical"("table_prefix");

-- CreateIndex
CREATE INDEX "gv_cfg_vertical_is_active_idx" ON "gv_cfg_vertical"("is_active");

-- CreateIndex
CREATE INDEX "gv_cfg_vertical_is_built_idx" ON "gv_cfg_vertical"("is_built");

-- CreateIndex
CREATE INDEX "gv_cfg_vertical_module_module_code_idx" ON "gv_cfg_vertical_module"("module_code");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_vertical_module_vertical_id_module_code_key" ON "gv_cfg_vertical_module"("vertical_id", "module_code");

-- CreateIndex
CREATE INDEX "gv_lic_packages_is_deleted_idx" ON "gv_lic_packages"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_lic_packages_tenant_id_idx" ON "gv_lic_packages"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_lic_packages_tenant_id_name_key" ON "gv_lic_packages"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "gv_lic_packages_tenant_id_code_key" ON "gv_lic_packages"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "gv_lic_tenant_usage_details_is_deleted_idx" ON "gv_lic_tenant_usage_details"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_lic_tenant_usage_details_tenant_id_idx" ON "gv_lic_tenant_usage_details"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_lic_tenant_usage_details_tenant_id_resource_key_key" ON "gv_lic_tenant_usage_details"("tenant_id", "resource_key");

-- CreateIndex
CREATE UNIQUE INDEX "gv_pay_wallets_tenant_id_key" ON "gv_pay_wallets"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_pay_wallets_is_deleted_idx" ON "gv_pay_wallets"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_pay_wallets_tenant_id_idx" ON "gv_pay_wallets"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_pay_wallet_transactions_is_deleted_idx" ON "gv_pay_wallet_transactions"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_pay_wallet_transactions_wallet_id_created_at_idx" ON "gv_pay_wallet_transactions"("wallet_id", "created_at");

-- CreateIndex
CREATE INDEX "gv_pay_wallet_transactions_tenant_id_type_idx" ON "gv_pay_wallet_transactions"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "gv_pay_wallet_transactions_tenant_id_created_at_idx" ON "gv_pay_wallet_transactions"("tenant_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "gv_lic_coupons_code_key" ON "gv_lic_coupons"("code");

-- CreateIndex
CREATE UNIQUE INDEX "soft_lic_software_offers_code_key" ON "soft_lic_software_offers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "gv_lic_license_keys_license_key_key" ON "gv_lic_license_keys"("license_key");

-- CreateIndex
CREATE INDEX "gv_lic_license_keys_is_deleted_idx" ON "gv_lic_license_keys"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_lic_license_keys_tenant_id_idx" ON "gv_lic_license_keys"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_lic_license_keys_status_idx" ON "gv_lic_license_keys"("status");

-- CreateIndex
CREATE UNIQUE INDEX "soft_lic_ai_plans_plan_code_key" ON "soft_lic_ai_plans"("plan_code");

-- CreateIndex
CREATE UNIQUE INDEX "soft_lic_ai_plans_razorpay_plan_id_key" ON "soft_lic_ai_plans"("razorpay_plan_id");

-- CreateIndex
CREATE INDEX "soft_lic_ai_plans_is_active_idx" ON "soft_lic_ai_plans"("is_active");

-- CreateIndex
CREATE INDEX "soft_lic_ai_plans_is_deleted_idx" ON "soft_lic_ai_plans"("is_deleted");

-- CreateIndex
CREATE INDEX "soft_lic_ai_plans_marketplace_module_id_idx" ON "soft_lic_ai_plans"("marketplace_module_id");

-- CreateIndex
CREATE INDEX "soft_lic_ai_plans_razorpay_plan_id_idx" ON "soft_lic_ai_plans"("razorpay_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "soft_lic_ai_subscriptions_razorpay_subscription_id_key" ON "soft_lic_ai_subscriptions"("razorpay_subscription_id");

-- CreateIndex
CREATE INDEX "soft_lic_ai_subscriptions_tenant_id_idx" ON "soft_lic_ai_subscriptions"("tenant_id");

-- CreateIndex
CREATE INDEX "soft_lic_ai_subscriptions_status_idx" ON "soft_lic_ai_subscriptions"("status");

-- CreateIndex
CREATE INDEX "soft_lic_ai_subscriptions_razorpay_subscription_id_idx" ON "soft_lic_ai_subscriptions"("razorpay_subscription_id");

-- CreateIndex
CREATE INDEX "soft_lic_ai_subscriptions_next_billing_at_idx" ON "soft_lic_ai_subscriptions"("next_billing_at");

-- CreateIndex
CREATE INDEX "soft_lic_ai_subscriptions_is_deleted_idx" ON "soft_lic_ai_subscriptions"("is_deleted");

-- CreateIndex
CREATE INDEX "soft_lic_ai_subscriptions_tenant_id_status_idx" ON "soft_lic_ai_subscriptions"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "soft_lic_ai_subscription_items_subscription_id_idx" ON "soft_lic_ai_subscription_items"("subscription_id");

-- CreateIndex
CREATE INDEX "soft_lic_ai_subscription_items_item_type_item_ref_id_idx" ON "soft_lic_ai_subscription_items"("item_type", "item_ref_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_lic_subscription_packages_package_code_key" ON "gv_lic_subscription_packages"("package_code");

-- CreateIndex
CREATE INDEX "gv_lic_subscription_packages_industry_code_is_active_idx" ON "gv_lic_subscription_packages"("industry_code", "is_active");

-- CreateIndex
CREATE INDEX "gv_lic_coupon_redemptions_is_deleted_idx" ON "gv_lic_coupon_redemptions"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_lic_coupon_redemptions_coupon_id_idx" ON "gv_lic_coupon_redemptions"("coupon_id");

-- CreateIndex
CREATE INDEX "gv_lic_coupon_redemptions_tenant_id_idx" ON "gv_lic_coupon_redemptions"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_lic_coupon_redemptions_coupon_id_tenant_id_user_id_key" ON "gv_lic_coupon_redemptions"("coupon_id", "tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_lic_package_modules_package_id_module_id_key" ON "gv_lic_package_modules"("package_id", "module_id");

-- CreateIndex
CREATE INDEX "gv_qa_environments_tenant_id_idx" ON "gv_qa_environments"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_qa_environments_status_idx" ON "gv_qa_environments"("status");

-- CreateIndex
CREATE INDEX "gv_qa_environments_expires_at_idx" ON "gv_qa_environments"("expires_at");

-- CreateIndex
CREATE INDEX "gv_qa_runs_tenant_id_idx" ON "gv_qa_runs"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_qa_runs_status_idx" ON "gv_qa_runs"("status");

-- CreateIndex
CREATE INDEX "gv_qa_runs_test_env_id_idx" ON "gv_qa_runs"("test_env_id");

-- CreateIndex
CREATE INDEX "gv_qa_results_test_run_id_idx" ON "gv_qa_results"("test_run_id");

-- CreateIndex
CREATE INDEX "gv_qa_results_test_run_id_test_type_idx" ON "gv_qa_results"("test_run_id", "test_type");

-- CreateIndex
CREATE INDEX "gv_qa_results_test_run_id_status_idx" ON "gv_qa_results"("test_run_id", "status");

-- CreateIndex
CREATE INDEX "gv_qa_results_module_idx" ON "gv_qa_results"("module");

-- CreateIndex
CREATE INDEX "gv_qa_groups_tenant_id_idx" ON "gv_qa_groups"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_qa_groups_tenant_id_status_idx" ON "gv_qa_groups"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "gv_qa_group_executions_test_group_id_idx" ON "gv_qa_group_executions"("test_group_id");

-- CreateIndex
CREATE INDEX "gv_qa_group_executions_tenant_id_idx" ON "gv_qa_group_executions"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_qa_manual_logs_tenant_id_idx" ON "gv_qa_manual_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_qa_manual_logs_test_run_id_idx" ON "gv_qa_manual_logs"("test_run_id");

-- CreateIndex
CREATE INDEX "gv_qa_manual_logs_module_idx" ON "gv_qa_manual_logs"("module");

-- CreateIndex
CREATE INDEX "gv_qa_manual_logs_status_idx" ON "gv_qa_manual_logs"("status");

-- CreateIndex
CREATE INDEX "gv_qa_scheduled_tests_tenant_id_idx" ON "gv_qa_scheduled_tests"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_qa_scheduled_tests_tenant_id_is_active_idx" ON "gv_qa_scheduled_tests"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "gv_qa_scheduled_tests_next_run_at_idx" ON "gv_qa_scheduled_tests"("next_run_at");

-- CreateIndex
CREATE INDEX "gv_qa_scheduled_runs_scheduled_test_id_idx" ON "gv_qa_scheduled_runs"("scheduled_test_id");

-- CreateIndex
CREATE INDEX "gv_qa_scheduled_runs_scheduled_test_id_status_idx" ON "gv_qa_scheduled_runs"("scheduled_test_id", "status");

-- CreateIndex
CREATE INDEX "gv_qa_plans_tenant_id_idx" ON "gv_qa_plans"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_qa_plans_tenant_id_status_idx" ON "gv_qa_plans"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "gv_qa_plan_items_plan_id_idx" ON "gv_qa_plan_items"("plan_id");

-- CreateIndex
CREATE INDEX "gv_qa_plan_items_plan_id_status_idx" ON "gv_qa_plan_items"("plan_id", "status");

-- CreateIndex
CREATE INDEX "gv_qa_plan_items_module_name_idx" ON "gv_qa_plan_items"("module_name");

-- CreateIndex
CREATE INDEX "gv_qa_evidences_plan_item_id_idx" ON "gv_qa_evidences"("plan_item_id");

-- CreateIndex
CREATE INDEX "gv_qa_error_logs_test_run_id_idx" ON "gv_qa_error_logs"("test_run_id");

-- CreateIndex
CREATE INDEX "gv_qa_error_logs_error_category_idx" ON "gv_qa_error_logs"("error_category");

-- CreateIndex
CREATE INDEX "gv_qa_error_logs_severity_idx" ON "gv_qa_error_logs"("severity");

-- CreateIndex
CREATE INDEX "gv_qa_error_logs_is_resolved_idx" ON "gv_qa_error_logs"("is_resolved");

-- CreateIndex
CREATE UNIQUE INDEX "gv_qa_reports_test_run_id_key" ON "gv_qa_reports"("test_run_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_ven_marketplace_vendors_contact_email_key" ON "gv_ven_marketplace_vendors"("contact_email");

-- AddForeignKey
ALTER TABLE "gv_mkt_marketplace_modules" ADD CONSTRAINT "gv_mkt_marketplace_modules_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "gv_ven_marketplace_vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_mkt_marketplace_reviews" ADD CONSTRAINT "gv_mkt_marketplace_reviews_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "gv_mkt_marketplace_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_mkt_tenant_modules" ADD CONSTRAINT "gv_mkt_tenant_modules_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "gv_mkt_marketplace_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_mkt_listing_price_tiers" ADD CONSTRAINT "gv_mkt_listing_price_tiers_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "gv_mkt_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_mkt_post_engagements" ADD CONSTRAINT "gv_mkt_post_engagements_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "gv_mkt_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_mkt_post_comments" ADD CONSTRAINT "gv_mkt_post_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "gv_mkt_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_mkt_post_comments" ADD CONSTRAINT "gv_mkt_post_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "gv_mkt_post_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_mkt_enquiries" ADD CONSTRAINT "gv_mkt_enquiries_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "gv_mkt_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_mkt_order_items" ADD CONSTRAINT "gv_mkt_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "gv_mkt_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_mkt_order_items" ADD CONSTRAINT "gv_mkt_order_items_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "gv_mkt_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_mkt_listing_analytics" ADD CONSTRAINT "gv_mkt_listing_analytics_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "gv_mkt_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_mkt_post_analytics" ADD CONSTRAINT "gv_mkt_post_analytics_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "gv_mkt_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_lookup_values" ADD CONSTRAINT "gv_cfg_lookup_values_lookup_id_fkey" FOREIGN KEY ("lookup_id") REFERENCES "gv_cfg_master_lookups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_lookup_values" ADD CONSTRAINT "gv_cfg_lookup_values_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "gv_cfg_lookup_values"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_industry_packages" ADD CONSTRAINT "gv_cfg_industry_packages_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "gv_cfg_business_type_registry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_industry_packages" ADD CONSTRAINT "gv_cfg_industry_packages_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "gv_lic_subscription_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_tenant_modules" ADD CONSTRAINT "gv_cfg_tenant_modules_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "gv_cfg_module_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_tenant_plugins" ADD CONSTRAINT "gv_cfg_tenant_plugins_plugin_id_fkey" FOREIGN KEY ("plugin_id") REFERENCES "gv_cfg_plugin_registry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_industry_patches" ADD CONSTRAINT "gv_cfg_industry_patches_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "gv_cfg_app_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_vertical_module" ADD CONSTRAINT "gv_cfg_vertical_module_vertical_id_fkey" FOREIGN KEY ("vertical_id") REFERENCES "gv_cfg_vertical"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_pay_wallet_transactions" ADD CONSTRAINT "gv_pay_wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "gv_pay_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_lic_coupons" ADD CONSTRAINT "gv_lic_coupons_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "gv_lic_subscription_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soft_lic_ai_subscriptions" ADD CONSTRAINT "soft_lic_ai_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "soft_lic_ai_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soft_lic_ai_subscription_items" ADD CONSTRAINT "soft_lic_ai_subscription_items_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "soft_lic_ai_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_lic_coupon_redemptions" ADD CONSTRAINT "gv_lic_coupon_redemptions_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "gv_lic_coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_lic_package_modules" ADD CONSTRAINT "gv_lic_package_modules_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "gv_lic_subscription_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_lic_package_modules" ADD CONSTRAINT "gv_lic_package_modules_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "gv_cfg_module_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_qa_results" ADD CONSTRAINT "gv_qa_results_test_run_id_fkey" FOREIGN KEY ("test_run_id") REFERENCES "gv_qa_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_qa_group_executions" ADD CONSTRAINT "gv_qa_group_executions_test_group_id_fkey" FOREIGN KEY ("test_group_id") REFERENCES "gv_qa_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_qa_scheduled_runs" ADD CONSTRAINT "gv_qa_scheduled_runs_scheduled_test_id_fkey" FOREIGN KEY ("scheduled_test_id") REFERENCES "gv_qa_scheduled_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_qa_plan_items" ADD CONSTRAINT "gv_qa_plan_items_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "gv_qa_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_qa_evidences" ADD CONSTRAINT "gv_qa_evidences_plan_item_id_fkey" FOREIGN KEY ("plan_item_id") REFERENCES "gv_qa_plan_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_qa_error_logs" ADD CONSTRAINT "gv_qa_error_logs_test_run_id_fkey" FOREIGN KEY ("test_run_id") REFERENCES "gv_qa_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_qa_error_logs" ADD CONSTRAINT "gv_qa_error_logs_test_result_id_fkey" FOREIGN KEY ("test_result_id") REFERENCES "gv_qa_results"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_qa_reports" ADD CONSTRAINT "gv_qa_reports_test_run_id_fkey" FOREIGN KEY ("test_run_id") REFERENCES "gv_qa_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

