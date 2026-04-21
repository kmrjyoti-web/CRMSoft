-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PARTIALLY_VERIFIED', 'FULLY_VERIFIED');

-- CreateEnum
CREATE TYPE "RegistrationType" AS ENUM ('INDIVIDUAL', 'BUSINESS');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('EMAIL_VERIFICATION', 'MOBILE_VERIFICATION', 'PASSWORD_RESET', 'LOGIN_OTP', 'TRANSACTION');

-- CreateEnum
CREATE TYPE "OtpStatus" AS ENUM ('OTP_PENDING', 'OTP_VERIFIED', 'OTP_EXPIRED', 'OTP_FAILED');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('RAW', 'VALIDATED');

-- CreateEnum
CREATE TYPE "ContactSource" AS ENUM ('MANUAL', 'BULK_IMPORT', 'WEB_FORM', 'REFERRAL', 'API');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('RAW_CONTACT', 'CONTACT', 'ORGANIZATION', 'LEAD', 'QUOTATION', 'TICKET', 'PRODUCT');

-- CreateEnum
CREATE TYPE "RuleConditionOperator" AS ENUM ('EQUALS', 'NOT_EQUALS', 'CONTAINS', 'GREATER_THAN', 'LESS_THAN', 'IN', 'NOT_IN', 'IS_EMPTY', 'IS_NOT_EMPTY');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ADMIN', 'EMPLOYEE', 'CUSTOMER', 'REFERRAL_PARTNER');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRIAL', 'DEMO', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PlanInterval" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'CAPTURED', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "OnboardingStep" AS ENUM ('CREATED', 'PROFILE_COMPLETED', 'USERS_INVITED', 'DATA_IMPORTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "FeatureFlag" AS ENUM ('WHATSAPP_INTEGRATION', 'EMAIL_INTEGRATION', 'BULK_IMPORT', 'BULK_EXPORT', 'DOCUMENTS', 'WORKFLOWS', 'QUOTATION_AI', 'ADVANCED_REPORTS', 'CUSTOM_FIELDS', 'API_ACCESS', 'QUOTATIONS', 'INVOICES', 'DEMOS', 'TOUR_PLANS', 'ACTIVITIES', 'INSTALLATIONS', 'TRAININGS', 'TICKETS', 'AI_FEATURES', 'WALLET');

-- CreateEnum
CREATE TYPE "CalendarSourceType" AS ENUM ('TASK', 'ACTIVITY', 'DEMO', 'TOUR_PLAN', 'REMINDER', 'FOLLOW_UP', 'SCHEDULED_EVENT', 'EXTERNAL_GOOGLE', 'EXTERNAL_OUTLOOK');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'RESTORE', 'STATUS_CHANGE', 'BULK_UPDATE', 'BULK_DELETE', 'LOGIN', 'LOGOUT', 'EXPORT');

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('USER', 'ROLE', 'PERMISSION', 'CONTACT', 'ORGANIZATION', 'LEAD', 'ACTIVITY', 'DEMO', 'TOUR_PLAN', 'QUOTATION', 'LOOKUP_VALUE', 'MASTER_LOOKUP', 'ENTITY_OWNER', 'OWNERSHIP_LOG', 'FOLLOW_UP', 'REMINDER', 'RECURRENCE_RULE', 'ASSIGNMENT_RULE', 'SALES_TARGET', 'NOTIFICATION', 'QUOTATION_TEMPLATE', 'PRODUCT', 'INVOICE', 'PAYMENT', 'WORKFLOW', 'COMMUNICATION', 'OTHER');

-- CreateEnum
CREATE TYPE "DuplicateConfidence" AS ENUM ('EXACT', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "ValidatorType" AS ENUM ('REQUIRED', 'EMAIL', 'INDIAN_MOBILE', 'PHONE', 'GST_NUMBER', 'PAN_NUMBER', 'TAN_NUMBER', 'AADHAAR', 'IFSC_CODE', 'PINCODE', 'WEBSITE', 'URL', 'NUMERIC', 'DECIMAL', 'DATE', 'ENUM', 'CUSTOM_REGEX', 'MIN_LENGTH', 'MAX_LENGTH');

-- CreateEnum
CREATE TYPE "WaChatbotNodeType" AS ENUM ('WELCOME', 'KEYWORD_TRIGGER', 'MENU', 'TEXT_REPLY', 'MEDIA_REPLY', 'QUICK_BUTTONS', 'COLLECT_INPUT', 'CONDITION', 'API_CALL', 'ASSIGN_AGENT', 'DELAY', 'TAG_CONTACT', 'LINK_LEAD');

-- CreateEnum
CREATE TYPE "SyncWarningLevel" AS ENUM ('INFO', 'WARNING', 'URGENT', 'BLOCK');

-- CreateEnum
CREATE TYPE "ConfigCategory" AS ENUM ('GENERAL', 'NUMBERING', 'BUSINESS_HOURS', 'LEAD_SETTINGS', 'COMMUNICATION', 'NOTIFICATION', 'DISPLAY', 'SECURITY', 'SYNC', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ConfigValueType" AS ENUM ('STRING', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'JSON', 'ENUM');

-- CreateEnum
CREATE TYPE "CredentialProvider" AS ENUM ('GMAIL', 'OUTLOOK', 'SMTP', 'WHATSAPP_BUSINESS', 'RAZORPAY', 'STRIPE', 'AWS_S3', 'MINIO', 'GOOGLE_DRIVE', 'ONEDRIVE', 'DROPBOX', 'GOOGLE_MAPS', 'EXOTEL', 'KNOWLARITY', 'TWILIO', 'FIREBASE', 'SENDGRID', 'MAILGUN', 'CUSTOM', 'ANTHROPIC_CLAUDE', 'OPENAI_GPT', 'GOOGLE_GEMINI', 'GROQ');

-- CreateEnum
CREATE TYPE "CredentialStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED', 'ERROR', 'PENDING_SETUP', 'REVOKED');

-- CreateEnum
CREATE TYPE "AuditSessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TenantAuditActionType" AS ENUM ('PAGE_VISIT', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'SETTINGS_CHANGE', 'PERMISSION_DENIED', 'API_CALL', 'FILE_UPLOAD', 'FILE_DOWNLOAD', 'SEARCH', 'BULK_ACTION');

-- CreateEnum
CREATE TYPE "RetentionAction" AS ENUM ('ARCHIVE', 'SOFT_DELETE', 'HARD_DELETE', 'ANONYMIZE');

-- CreateEnum
CREATE TYPE "IpRuleType" AS ENUM ('WHITELIST', 'BLACKLIST');

-- CreateEnum
CREATE TYPE "LimitType" AS ENUM ('TOTAL', 'MONTHLY', 'UNLIMITED', 'DISABLED');

-- CreateEnum
CREATE TYPE "DbStrategy" AS ENUM ('SHARED', 'DEDICATED');

-- CreateEnum
CREATE TYPE "ModuleAccessLevel" AS ENUM ('MOD_DISABLED', 'MOD_READONLY', 'MOD_FULL');

-- CreateEnum
CREATE TYPE "FeatureType" AS ENUM ('PAGE', 'WIDGET', 'REPORT', 'ACTION', 'INTEGRATION');

-- CreateEnum
CREATE TYPE "EntityLimitType" AS ENUM ('CONTACTS', 'ORGANIZATIONS', 'LEADS', 'QUOTATIONS', 'INVOICES', 'PRODUCTS', 'USERS', 'FILE_STORAGE_MB', 'DB_SIZE_MB', 'MARKETPLACE_PROMOTIONS', 'EMAIL_PER_MONTH', 'WHATSAPP_PER_MONTH', 'SMS_PER_MONTH', 'API_CALLS_PER_DAY', 'REPORTS_COUNT', 'WORKFLOWS_COUNT', 'CUSTOM_FIELDS_COUNT');

-- CreateTable
CREATE TABLE "gv_aud_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "entity_type" "AuditEntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "entity_label" TEXT,
    "action" "AuditAction" NOT NULL,
    "summary" TEXT NOT NULL,
    "change_count" INTEGER NOT NULL DEFAULT 0,
    "before_snapshot" JSONB,
    "after_snapshot" JSONB,
    "performed_by_id" TEXT,
    "performed_by_name" TEXT,
    "performed_by_email" TEXT,
    "performed_by_role" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "http_method" TEXT,
    "request_url" TEXT,
    "request_body" JSONB,
    "source" TEXT,
    "module" TEXT,
    "correlation_id" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_sensitive" BOOLEAN NOT NULL DEFAULT false,
    "is_system_action" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_aud_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_aud_field_changes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "audit_log_id" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "field_label" TEXT,
    "field_type" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "old_display_value" TEXT,
    "new_display_value" TEXT,
    "is_sensitive" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_aud_field_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_aud_retention_policies" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "entity_type" "AuditEntityType" NOT NULL,
    "retention_days" INTEGER NOT NULL,
    "archive_enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_aud_retention_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_aud_credential_access_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "credential_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "accessed_by_id" TEXT NOT NULL,
    "accessed_by_name" TEXT NOT NULL,
    "accessed_by_ip" TEXT,
    "provider" TEXT NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_aud_credential_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_aud_tenant_sessions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "started_by_id" TEXT NOT NULL,
    "started_by_name" TEXT,
    "reason" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "scheduled_end_at" TIMESTAMP(3),
    "status" "AuditSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "total_actions" INTEGER NOT NULL DEFAULT 0,
    "unique_users" INTEGER NOT NULL DEFAULT 0,
    "report_generated_at" TIMESTAMP(3),
    "report_url" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_aud_tenant_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_aud_tenant_logs" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT,
    "user_role" TEXT,
    "action_type" "TenantAuditActionType" NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "page_url" TEXT,
    "duration_ms" INTEGER,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "device_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_aud_tenant_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_aud_customer_portal_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "customer_user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "route" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gv_aud_customer_portal_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_menus" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "icon" TEXT,
    "route" TEXT,
    "parent_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "menu_type" TEXT NOT NULL DEFAULT 'ITEM',
    "permission_module" TEXT,
    "permission_action" TEXT,
    "badge_color" TEXT,
    "badge_text" TEXT,
    "open_in_new_tab" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "requires_credential" BOOLEAN NOT NULL DEFAULT false,
    "credential_key" TEXT,
    "business_type_applicability" JSONB NOT NULL DEFAULT '["ALL"]',
    "auto_enable_with_module" TEXT,
    "terminology_key" TEXT,
    "industry_code" TEXT,
    "is_admin_only" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_tenant_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "category" "ConfigCategory" NOT NULL,
    "config_key" TEXT NOT NULL,
    "config_value" TEXT NOT NULL,
    "value_type" "ConfigValueType" NOT NULL DEFAULT 'STRING',
    "default_value" TEXT,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "group_name" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "validation_rule" TEXT,
    "min_value" DECIMAL(10,2),
    "max_value" DECIMAL(10,2),
    "enum_options" JSONB,
    "is_read_only" BOOLEAN NOT NULL DEFAULT false,
    "required_role" TEXT,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,

    CONSTRAINT "gv_cfg_tenant_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_tenant_credentials" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "provider" "CredentialProvider" NOT NULL,
    "instance_name" TEXT,
    "encrypted_data" TEXT NOT NULL,
    "encryption_version" INTEGER NOT NULL DEFAULT 1,
    "status" "CredentialStatus" NOT NULL DEFAULT 'PENDING_SETUP',
    "status_message" TEXT,
    "last_verified_at" TIMESTAMP(3),
    "last_verify_error" TEXT,
    "verify_count" INTEGER NOT NULL DEFAULT 0,
    "token_expires_at" TIMESTAMP(3),
    "last_refreshed_at" TIMESTAMP(3),
    "refresh_fail_count" INTEGER NOT NULL DEFAULT 0,
    "last_used_at" TIMESTAMP(3),
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "daily_usage_count" INTEGER NOT NULL DEFAULT 0,
    "daily_usage_limit" INTEGER,
    "description" TEXT,
    "linked_account_email" TEXT,
    "webhook_url" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" TEXT NOT NULL,
    "created_by_name" TEXT NOT NULL,
    "updated_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,

    CONSTRAINT "gv_cfg_tenant_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_global_default_credentials" (
    "id" TEXT NOT NULL,
    "provider" "CredentialProvider" NOT NULL,
    "encrypted_data" TEXT NOT NULL,
    "encryption_version" INTEGER NOT NULL DEFAULT 1,
    "status" "CredentialStatus" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_cfg_global_default_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_tenant_brandings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "logo_url" TEXT,
    "logo_light_url" TEXT,
    "favicon_url" TEXT,
    "login_banner_url" TEXT,
    "email_header_logo_url" TEXT,
    "primary_color" TEXT NOT NULL DEFAULT '#1976D2',
    "secondary_color" TEXT NOT NULL DEFAULT '#424242',
    "accent_color" TEXT NOT NULL DEFAULT '#FF5722',
    "sidebar_color" TEXT NOT NULL DEFAULT '#263238',
    "sidebar_text_color" TEXT NOT NULL DEFAULT '#FFFFFF',
    "header_color" TEXT NOT NULL DEFAULT '#FFFFFF',
    "header_text_color" TEXT NOT NULL DEFAULT '#333333',
    "button_color" TEXT NOT NULL DEFAULT '#1976D2',
    "button_text_color" TEXT NOT NULL DEFAULT '#FFFFFF',
    "link_color" TEXT NOT NULL DEFAULT '#1976D2',
    "danger_color" TEXT NOT NULL DEFAULT '#D32F2F',
    "success_color" TEXT NOT NULL DEFAULT '#388E3C',
    "warning_color" TEXT NOT NULL DEFAULT '#F57C00',
    "font_family" TEXT NOT NULL DEFAULT 'Inter, sans-serif',
    "heading_font_family" TEXT,
    "font_size" TEXT NOT NULL DEFAULT '14px',
    "custom_domain" TEXT,
    "domain_verified" BOOLEAN NOT NULL DEFAULT false,
    "domain_verify_token" TEXT,
    "domain_verify_method" TEXT,
    "ssl_enabled" BOOLEAN NOT NULL DEFAULT false,
    "ssl_expires_at" TIMESTAMP(3),
    "login_page_title" TEXT,
    "login_page_subtitle" TEXT,
    "show_powered_by" BOOLEAN NOT NULL DEFAULT true,
    "custom_css" TEXT,
    "updated_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,

    CONSTRAINT "gv_cfg_tenant_brandings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_security_policies" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "password_min_length" INTEGER NOT NULL DEFAULT 8,
    "password_max_length" INTEGER NOT NULL DEFAULT 128,
    "require_uppercase" BOOLEAN NOT NULL DEFAULT true,
    "require_lowercase" BOOLEAN NOT NULL DEFAULT true,
    "require_numbers" BOOLEAN NOT NULL DEFAULT true,
    "require_special_chars" BOOLEAN NOT NULL DEFAULT false,
    "password_expiry_days" INTEGER,
    "prevent_reuse_count" INTEGER NOT NULL DEFAULT 3,
    "max_login_attempts" INTEGER NOT NULL DEFAULT 5,
    "lockout_duration_minutes" INTEGER NOT NULL DEFAULT 30,
    "require_captcha_after" INTEGER,
    "session_timeout_minutes" INTEGER NOT NULL DEFAULT 480,
    "max_concurrent_sessions" INTEGER NOT NULL DEFAULT 3,
    "single_session_per_user" BOOLEAN NOT NULL DEFAULT false,
    "session_extend_on_activity" BOOLEAN NOT NULL DEFAULT true,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_method" TEXT,
    "two_factor_grace_period_days" INTEGER,
    "ip_restriction_enabled" BOOLEAN NOT NULL DEFAULT false,
    "enforce_audit_log" BOOLEAN NOT NULL DEFAULT true,
    "log_login_attempts" BOOLEAN NOT NULL DEFAULT true,
    "log_data_exports" BOOLEAN NOT NULL DEFAULT true,
    "api_access_enabled" BOOLEAN NOT NULL DEFAULT false,
    "api_rate_limit_per_minute" INTEGER NOT NULL DEFAULT 60,
    "updated_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,

    CONSTRAINT "gv_cfg_security_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_ip_access_rules" (
    "id" TEXT NOT NULL,
    "security_policy_id" TEXT NOT NULL,
    "ruleType" "IpRuleType" NOT NULL,
    "ip_address" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gv_cfg_ip_access_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_data_retention_policies" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "entity_name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "retention_days" INTEGER NOT NULL,
    "action" "RetentionAction" NOT NULL,
    "scope_filter" JSONB,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_executed_at" TIMESTAMP(3),
    "last_records_affected" INTEGER,
    "require_approval" BOOLEAN NOT NULL DEFAULT false,
    "notify_before_days" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_data_retention_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_terminology_overrides" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "business_type_id" TEXT,
    "term_key" TEXT NOT NULL,
    "default_label" TEXT NOT NULL,
    "custom_label" TEXT NOT NULL,
    "regional_label" TEXT,
    "user_help_text" TEXT,
    "scope" TEXT NOT NULL DEFAULT 'GLOBAL',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_terminology_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_tenant_versions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "version_id" TEXT NOT NULL,
    "current_version" TEXT NOT NULL,
    "previous_version" TEXT,
    "updated_at_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "update_method" TEXT NOT NULL DEFAULT 'AUTO',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "patches_applied" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "force_update_pending" BOOLEAN NOT NULL DEFAULT false,
    "force_update_message" TEXT,
    "force_update_deadline" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_tenant_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_version_backups" (
    "id" TEXT NOT NULL,
    "version_id" TEXT NOT NULL,
    "backup_type" TEXT NOT NULL DEFAULT 'PRE_DEPLOY',
    "db_dump_path" TEXT,
    "git_tag" TEXT,
    "config_snapshot" JSONB,
    "schema_snapshot" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "size_bytes" BIGINT,
    "restored_at" TIMESTAMP(3),
    "restored_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gv_cfg_version_backups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_customer_menu_categories" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_hi" TEXT,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "enabled_routes" JSONB NOT NULL DEFAULT '[]',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_id" TEXT NOT NULL,

    CONSTRAINT "gv_cfg_customer_menu_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_lic_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "interval" "PlanInterval" NOT NULL DEFAULT 'MONTHLY',
    "price" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "max_users" INTEGER NOT NULL DEFAULT 3,
    "max_contacts" INTEGER NOT NULL DEFAULT 100,
    "max_leads" INTEGER NOT NULL DEFAULT 50,
    "max_products" INTEGER NOT NULL DEFAULT 20,
    "max_storage" INTEGER NOT NULL DEFAULT 100,
    "features" "FeatureFlag"[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "config_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_lic_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_lic_subscriptions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "plan_id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "current_period_start" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "trial_ends_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "gateway_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_lic_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_lic_tenant_invoices" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "invoice_number" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paid_at" TIMESTAMP(3),
    "gateway_payment_id" TEXT,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "pdf_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_lic_tenant_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_lic_tenant_usage" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "users_count" INTEGER NOT NULL DEFAULT 0,
    "contacts_count" INTEGER NOT NULL DEFAULT 0,
    "leads_count" INTEGER NOT NULL DEFAULT 0,
    "products_count" INTEGER NOT NULL DEFAULT 0,
    "storage_mb" INTEGER NOT NULL DEFAULT 0,
    "last_calculated" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_lic_tenant_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_lic_plan_limits" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "resource_key" TEXT NOT NULL,
    "limit_type" "LimitType" NOT NULL DEFAULT 'TOTAL',
    "limit_value" INTEGER NOT NULL DEFAULT 0,
    "is_chargeable" BOOLEAN NOT NULL DEFAULT false,
    "charge_tokens" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_lic_plan_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_lic_plan_module_access" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "module_code" TEXT NOT NULL,
    "access_level" "ModuleAccessLevel" NOT NULL DEFAULT 'MOD_FULL',
    "custom_config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_lic_plan_module_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_usr_users" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_type" "UserType" NOT NULL DEFAULT 'EMPLOYEE',
    "last_login_at" TIMESTAMP(3),
    "role_id" TEXT NOT NULL,
    "department_id" TEXT,
    "designation_id" TEXT,
    "reporting_to_id" TEXT,
    "employee_code" TEXT,
    "joining_date" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verified_at" TIMESTAMP(3),
    "mobile_verified" BOOLEAN NOT NULL DEFAULT false,
    "mobile_verified_at" TIMESTAMP(3),
    "registration_type" "RegistrationType" NOT NULL DEFAULT 'INDIVIDUAL',
    "company_name" TEXT,
    "gst_number" TEXT,
    "gst_verified" BOOLEAN NOT NULL DEFAULT false,
    "gst_verified_at" TIMESTAMP(3),
    "gst_verification_method" TEXT,
    "pan_number" TEXT,
    "business_type" TEXT,
    "annual_turnover" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_usr_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_usr_customer_profiles" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "user_id" TEXT NOT NULL,
    "company_name" TEXT,
    "gst_number" TEXT,
    "billing_address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "pincode" TEXT,
    "industry" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_usr_customer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_usr_referral_partners" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "user_id" TEXT NOT NULL,
    "referral_code" TEXT NOT NULL,
    "commission_rate" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "total_referrals" INTEGER NOT NULL DEFAULT 0,
    "total_earnings" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "bank_name" TEXT,
    "bank_account" TEXT,
    "ifsc_code" TEXT,
    "pan_number" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_usr_referral_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_usr_departments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT,
    "parent_id" TEXT,
    "head_user_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_usr_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_usr_designations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "grade" TEXT,
    "department_id" TEXT,
    "parent_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_usr_designations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_usr_roles" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "level" INTEGER NOT NULL DEFAULT 5,
    "parent_role_name" TEXT,
    "can_manage_levels" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_usr_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_usr_permissions" (
    "id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gv_usr_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_usr_role_permissions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_usr_role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_usr_role_menu_permissions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "menu_id" TEXT NOT NULL,
    "can_view" BOOLEAN NOT NULL DEFAULT false,
    "can_create" BOOLEAN NOT NULL DEFAULT false,
    "can_edit" BOOLEAN NOT NULL DEFAULT false,
    "can_delete" BOOLEAN NOT NULL DEFAULT false,
    "can_export" BOOLEAN NOT NULL DEFAULT false,
    "can_import" BOOLEAN NOT NULL DEFAULT false,
    "can_bulk_update" BOOLEAN NOT NULL DEFAULT false,
    "can_bulk_delete" BOOLEAN NOT NULL DEFAULT false,
    "can_approve" BOOLEAN NOT NULL DEFAULT false,
    "can_assign" BOOLEAN NOT NULL DEFAULT false,
    "can_transfer" BOOLEAN NOT NULL DEFAULT false,
    "can_view_all" BOOLEAN NOT NULL DEFAULT false,
    "can_edit_all" BOOLEAN NOT NULL DEFAULT false,
    "can_delete_all" BOOLEAN NOT NULL DEFAULT false,
    "restricted_fields" JSONB,
    "inherit_from_parent" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_id" TEXT,
    "updated_by_id" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,

    CONSTRAINT "gv_usr_role_menu_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_usr_permission_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "tenant_id" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "permissions" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_usr_permission_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_usr_capacities" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "user_id" TEXT NOT NULL,
    "max_leads" INTEGER NOT NULL DEFAULT 50,
    "max_contacts" INTEGER NOT NULL DEFAULT 100,
    "max_organizations" INTEGER NOT NULL DEFAULT 30,
    "max_quotations" INTEGER NOT NULL DEFAULT 20,
    "max_total" INTEGER NOT NULL DEFAULT 200,
    "active_leads" INTEGER NOT NULL DEFAULT 0,
    "active_contacts" INTEGER NOT NULL DEFAULT 0,
    "active_organizations" INTEGER NOT NULL DEFAULT 0,
    "active_quotations" INTEGER NOT NULL DEFAULT 0,
    "active_total" INTEGER NOT NULL DEFAULT 0,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "unavailable_from" TIMESTAMP(3),
    "unavailable_to" TIMESTAMP(3),
    "delegate_to_id" TEXT,
    "avg_response_hours" DECIMAL(6,2),
    "conversion_rate" DECIMAL(5,2),
    "last_activity_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_usr_capacities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_usr_delegation_records" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "from_user_id" TEXT NOT NULL,
    "to_user_id" TEXT NOT NULL,
    "entity_type" "EntityType",
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_reverted" BOOLEAN NOT NULL DEFAULT false,
    "reverted_at" TIMESTAMP(3),
    "reason" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_usr_delegation_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_usr_permission_overrides" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "effect" TEXT NOT NULL DEFAULT 'grant',
    "reason" TEXT,
    "expires_at" TIMESTAMP(3),
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_usr_permission_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_usr_tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "logo" TEXT,
    "status" "TenantStatus" NOT NULL DEFAULT 'TRIAL',
    "onboarding_step" "OnboardingStep" NOT NULL DEFAULT 'CREATED',
    "settings" JSONB,
    "business_type_id" TEXT,
    "industry_code" TEXT,
    "trade_profile_json" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_usr_tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_usr_super_admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_usr_super_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_usr_tenant_profiles" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_legal_name" TEXT,
    "industry" TEXT,
    "website" TEXT,
    "support_email" TEXT,
    "db_strategy" "DbStrategy" NOT NULL DEFAULT 'SHARED',
    "db_connection_string" TEXT,
    "primary_contact_name" TEXT,
    "primary_contact_email" TEXT,
    "primary_contact_phone" TEXT,
    "billing_address" JSONB,
    "gstin" TEXT,
    "pan" TEXT,
    "account_manager_id" TEXT,
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "max_disk_quota_mb" INTEGER NOT NULL DEFAULT 500,
    "current_disk_usage_mb" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_usr_tenant_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_usr_verification_otps" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "user_id" TEXT,
    "target" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "status" "OtpStatus" NOT NULL DEFAULT 'OTP_PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "verified_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_usr_verification_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_usr_customer_users" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "linked_entity_type" TEXT NOT NULL,
    "linked_entity_id" TEXT NOT NULL,
    "linked_entity_name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "company_name" TEXT,
    "gstin" TEXT,
    "menu_category_id" TEXT,
    "page_overrides" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_first_login" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "login_count" INTEGER NOT NULL DEFAULT 0,
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "refresh_token" TEXT,
    "refresh_token_exp" TIMESTAMP(3),
    "password_reset_token" TEXT,
    "password_reset_exp" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_id" TEXT NOT NULL,

    CONSTRAINT "gv_usr_customer_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gv_aud_logs_is_deleted_idx" ON "gv_aud_logs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_aud_logs_entity_type_entity_id_created_at_idx" ON "gv_aud_logs"("entity_type", "entity_id", "created_at");

-- CreateIndex
CREATE INDEX "gv_aud_logs_performed_by_id_created_at_idx" ON "gv_aud_logs"("performed_by_id", "created_at");

-- CreateIndex
CREATE INDEX "gv_aud_logs_entity_type_action_created_at_idx" ON "gv_aud_logs"("entity_type", "action", "created_at");

-- CreateIndex
CREATE INDEX "gv_aud_logs_created_at_idx" ON "gv_aud_logs"("created_at");

-- CreateIndex
CREATE INDEX "gv_aud_logs_correlation_id_idx" ON "gv_aud_logs"("correlation_id");

-- CreateIndex
CREATE INDEX "gv_aud_logs_tenant_id_idx" ON "gv_aud_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_aud_field_changes_is_deleted_idx" ON "gv_aud_field_changes"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_aud_field_changes_audit_log_id_idx" ON "gv_aud_field_changes"("audit_log_id");

-- CreateIndex
CREATE INDEX "gv_aud_field_changes_field_name_created_at_idx" ON "gv_aud_field_changes"("field_name", "created_at");

-- CreateIndex
CREATE INDEX "gv_aud_field_changes_tenant_id_idx" ON "gv_aud_field_changes"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_aud_retention_policies_is_deleted_idx" ON "gv_aud_retention_policies"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_aud_retention_policies_tenant_id_idx" ON "gv_aud_retention_policies"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_aud_retention_policies_tenant_id_entity_type_key" ON "gv_aud_retention_policies"("tenant_id", "entity_type");

-- CreateIndex
CREATE INDEX "gv_aud_credential_access_logs_is_deleted_idx" ON "gv_aud_credential_access_logs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_aud_credential_access_logs_tenant_id_credential_id_creat_idx" ON "gv_aud_credential_access_logs"("tenant_id", "credential_id", "created_at");

-- CreateIndex
CREATE INDEX "gv_aud_tenant_sessions_is_deleted_idx" ON "gv_aud_tenant_sessions"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_aud_tenant_sessions_tenant_id_status_idx" ON "gv_aud_tenant_sessions"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "gv_aud_tenant_logs_is_deleted_idx" ON "gv_aud_tenant_logs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_aud_tenant_logs_session_id_created_at_idx" ON "gv_aud_tenant_logs"("session_id", "created_at");

-- CreateIndex
CREATE INDEX "gv_aud_tenant_logs_tenant_id_user_id_created_at_idx" ON "gv_aud_tenant_logs"("tenant_id", "user_id", "created_at");

-- CreateIndex
CREATE INDEX "gv_aud_customer_portal_logs_tenant_id_customer_user_id_idx" ON "gv_aud_customer_portal_logs"("tenant_id", "customer_user_id");

-- CreateIndex
CREATE INDEX "gv_aud_customer_portal_logs_tenant_id_created_at_idx" ON "gv_aud_customer_portal_logs"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "gv_cfg_menus_is_deleted_idx" ON "gv_cfg_menus"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_menus_tenant_id_idx" ON "gv_cfg_menus"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cfg_menus_industry_code_idx" ON "gv_cfg_menus"("industry_code");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_menus_tenant_id_code_key" ON "gv_cfg_menus"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "gv_cfg_tenant_configs_is_deleted_idx" ON "gv_cfg_tenant_configs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_tenant_configs_tenant_id_category_idx" ON "gv_cfg_tenant_configs"("tenant_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_tenant_configs_tenant_id_config_key_key" ON "gv_cfg_tenant_configs"("tenant_id", "config_key");

-- CreateIndex
CREATE INDEX "gv_cfg_tenant_credentials_is_deleted_idx" ON "gv_cfg_tenant_credentials"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_tenant_credentials_tenant_id_provider_status_idx" ON "gv_cfg_tenant_credentials"("tenant_id", "provider", "status");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_tenant_credentials_tenant_id_provider_instance_name_key" ON "gv_cfg_tenant_credentials"("tenant_id", "provider", "instance_name");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_global_default_credentials_provider_key" ON "gv_cfg_global_default_credentials"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_tenant_brandings_tenant_id_key" ON "gv_cfg_tenant_brandings"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cfg_tenant_brandings_is_deleted_idx" ON "gv_cfg_tenant_brandings"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_tenant_brandings_tenant_id_idx" ON "gv_cfg_tenant_brandings"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_security_policies_tenant_id_key" ON "gv_cfg_security_policies"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cfg_security_policies_is_deleted_idx" ON "gv_cfg_security_policies"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_security_policies_tenant_id_idx" ON "gv_cfg_security_policies"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cfg_data_retention_policies_is_deleted_idx" ON "gv_cfg_data_retention_policies"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_data_retention_policies_tenant_id_idx" ON "gv_cfg_data_retention_policies"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_data_retention_policies_tenant_id_entity_name_key" ON "gv_cfg_data_retention_policies"("tenant_id", "entity_name");

-- CreateIndex
CREATE INDEX "gv_cfg_terminology_overrides_is_deleted_idx" ON "gv_cfg_terminology_overrides"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_terminology_overrides_tenant_id_idx" ON "gv_cfg_terminology_overrides"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_terminology_overrides_tenant_id_term_key_scope_key" ON "gv_cfg_terminology_overrides"("tenant_id", "term_key", "scope");

-- CreateIndex
CREATE INDEX "gv_cfg_tenant_versions_is_deleted_idx" ON "gv_cfg_tenant_versions"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_tenant_versions_tenant_id_idx" ON "gv_cfg_tenant_versions"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cfg_tenant_versions_force_update_pending_idx" ON "gv_cfg_tenant_versions"("force_update_pending");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_tenant_versions_tenant_id_version_id_key" ON "gv_cfg_tenant_versions"("tenant_id", "version_id");

-- CreateIndex
CREATE INDEX "gv_cfg_version_backups_version_id_idx" ON "gv_cfg_version_backups"("version_id");

-- CreateIndex
CREATE INDEX "gv_cfg_version_backups_backup_type_idx" ON "gv_cfg_version_backups"("backup_type");

-- CreateIndex
CREATE INDEX "gv_cfg_customer_menu_categories_tenant_id_idx" ON "gv_cfg_customer_menu_categories"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_customer_menu_categories_tenant_id_name_key" ON "gv_cfg_customer_menu_categories"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "gv_lic_plans_name_key" ON "gv_lic_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "gv_lic_plans_code_key" ON "gv_lic_plans"("code");

-- CreateIndex
CREATE INDEX "gv_lic_subscriptions_is_deleted_idx" ON "gv_lic_subscriptions"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_lic_subscriptions_tenant_id_status_idx" ON "gv_lic_subscriptions"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "gv_lic_tenant_invoices_invoice_number_key" ON "gv_lic_tenant_invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "gv_lic_tenant_invoices_is_deleted_idx" ON "gv_lic_tenant_invoices"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_lic_tenant_invoices_tenant_id_idx" ON "gv_lic_tenant_invoices"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_lic_tenant_usage_tenant_id_key" ON "gv_lic_tenant_usage"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_lic_tenant_usage_is_deleted_idx" ON "gv_lic_tenant_usage"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_lic_tenant_usage_tenant_id_idx" ON "gv_lic_tenant_usage"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_lic_plan_limits_plan_id_idx" ON "gv_lic_plan_limits"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_lic_plan_limits_plan_id_resource_key_key" ON "gv_lic_plan_limits"("plan_id", "resource_key");

-- CreateIndex
CREATE INDEX "gv_lic_plan_module_access_plan_id_idx" ON "gv_lic_plan_module_access"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_lic_plan_module_access_plan_id_module_code_key" ON "gv_lic_plan_module_access"("plan_id", "module_code");

-- CreateIndex
CREATE INDEX "gv_usr_users_user_type_status_idx" ON "gv_usr_users"("user_type", "status");

-- CreateIndex
CREATE INDEX "gv_usr_users_tenant_id_idx" ON "gv_usr_users"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_usr_users_is_deleted_idx" ON "gv_usr_users"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_users_tenant_id_email_key" ON "gv_usr_users"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_users_tenant_id_employee_code_key" ON "gv_usr_users"("tenant_id", "employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_customer_profiles_user_id_key" ON "gv_usr_customer_profiles"("user_id");

-- CreateIndex
CREATE INDEX "gv_usr_customer_profiles_is_deleted_idx" ON "gv_usr_customer_profiles"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_usr_customer_profiles_tenant_id_idx" ON "gv_usr_customer_profiles"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_customer_profiles_tenant_id_user_id_key" ON "gv_usr_customer_profiles"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_referral_partners_user_id_key" ON "gv_usr_referral_partners"("user_id");

-- CreateIndex
CREATE INDEX "gv_usr_referral_partners_is_deleted_idx" ON "gv_usr_referral_partners"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_usr_referral_partners_tenant_id_idx" ON "gv_usr_referral_partners"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_referral_partners_tenant_id_user_id_key" ON "gv_usr_referral_partners"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_referral_partners_tenant_id_referral_code_key" ON "gv_usr_referral_partners"("tenant_id", "referral_code");

-- CreateIndex
CREATE INDEX "gv_usr_departments_is_deleted_idx" ON "gv_usr_departments"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_usr_departments_tenant_id_idx" ON "gv_usr_departments"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_departments_tenant_id_name_key" ON "gv_usr_departments"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_departments_tenant_id_code_key" ON "gv_usr_departments"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "gv_usr_designations_is_deleted_idx" ON "gv_usr_designations"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_usr_designations_tenant_id_idx" ON "gv_usr_designations"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_designations_tenant_id_name_key" ON "gv_usr_designations"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_designations_tenant_id_code_key" ON "gv_usr_designations"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "gv_usr_roles_is_deleted_idx" ON "gv_usr_roles"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_usr_roles_tenant_id_idx" ON "gv_usr_roles"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_roles_tenant_id_name_key" ON "gv_usr_roles"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_permissions_module_action_key" ON "gv_usr_permissions"("module", "action");

-- CreateIndex
CREATE INDEX "gv_usr_role_permissions_is_deleted_idx" ON "gv_usr_role_permissions"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_usr_role_permissions_tenant_id_idx" ON "gv_usr_role_permissions"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_role_permissions_tenant_id_role_id_permission_id_key" ON "gv_usr_role_permissions"("tenant_id", "role_id", "permission_id");

-- CreateIndex
CREATE INDEX "gv_usr_role_menu_permissions_is_deleted_idx" ON "gv_usr_role_menu_permissions"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_usr_role_menu_permissions_tenant_id_role_id_idx" ON "gv_usr_role_menu_permissions"("tenant_id", "role_id");

-- CreateIndex
CREATE INDEX "gv_usr_role_menu_permissions_menu_id_idx" ON "gv_usr_role_menu_permissions"("menu_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_role_menu_permissions_tenant_id_role_id_menu_id_key" ON "gv_usr_role_menu_permissions"("tenant_id", "role_id", "menu_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_permission_templates_code_key" ON "gv_usr_permission_templates"("code");

-- CreateIndex
CREATE INDEX "gv_usr_permission_templates_is_deleted_idx" ON "gv_usr_permission_templates"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_usr_permission_templates_tenant_id_idx" ON "gv_usr_permission_templates"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_permission_templates_tenant_id_name_key" ON "gv_usr_permission_templates"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_capacities_user_id_key" ON "gv_usr_capacities"("user_id");

-- CreateIndex
CREATE INDEX "gv_usr_capacities_is_deleted_idx" ON "gv_usr_capacities"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_usr_capacities_tenant_id_idx" ON "gv_usr_capacities"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_capacities_tenant_id_user_id_key" ON "gv_usr_capacities"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "gv_usr_delegation_records_is_deleted_idx" ON "gv_usr_delegation_records"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_usr_delegation_records_from_user_id_is_active_idx" ON "gv_usr_delegation_records"("from_user_id", "is_active");

-- CreateIndex
CREATE INDEX "gv_usr_delegation_records_to_user_id_is_active_idx" ON "gv_usr_delegation_records"("to_user_id", "is_active");

-- CreateIndex
CREATE INDEX "gv_usr_delegation_records_end_date_is_active_idx" ON "gv_usr_delegation_records"("end_date", "is_active");

-- CreateIndex
CREATE INDEX "gv_usr_delegation_records_tenant_id_idx" ON "gv_usr_delegation_records"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_usr_permission_overrides_is_deleted_idx" ON "gv_usr_permission_overrides"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_usr_permission_overrides_tenant_id_idx" ON "gv_usr_permission_overrides"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_permission_overrides_tenant_id_user_id_action_effect_key" ON "gv_usr_permission_overrides"("tenant_id", "user_id", "action", "effect");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_tenants_slug_key" ON "gv_usr_tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_tenants_domain_key" ON "gv_usr_tenants"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_super_admins_email_key" ON "gv_usr_super_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_tenant_profiles_tenant_id_key" ON "gv_usr_tenant_profiles"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_usr_tenant_profiles_is_deleted_idx" ON "gv_usr_tenant_profiles"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_usr_tenant_profiles_tenant_id_idx" ON "gv_usr_tenant_profiles"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_usr_verification_otps_is_deleted_idx" ON "gv_usr_verification_otps"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_usr_verification_otps_target_purpose_status_idx" ON "gv_usr_verification_otps"("target", "purpose", "status");

-- CreateIndex
CREATE INDEX "gv_usr_verification_otps_user_id_purpose_idx" ON "gv_usr_verification_otps"("user_id", "purpose");

-- CreateIndex
CREATE INDEX "gv_usr_verification_otps_expires_at_idx" ON "gv_usr_verification_otps"("expires_at");

-- CreateIndex
CREATE INDEX "gv_usr_verification_otps_tenant_id_idx" ON "gv_usr_verification_otps"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_usr_customer_users_tenant_id_idx" ON "gv_usr_customer_users"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_usr_customer_users_tenant_id_is_active_idx" ON "gv_usr_customer_users"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_customer_users_tenant_id_email_key" ON "gv_usr_customer_users"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "gv_usr_customer_users_tenant_id_linked_entity_type_linked_e_key" ON "gv_usr_customer_users"("tenant_id", "linked_entity_type", "linked_entity_id");

-- AddForeignKey
ALTER TABLE "gv_aud_field_changes" ADD CONSTRAINT "gv_aud_field_changes_audit_log_id_fkey" FOREIGN KEY ("audit_log_id") REFERENCES "gv_aud_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_aud_credential_access_logs" ADD CONSTRAINT "gv_aud_credential_access_logs_credential_id_fkey" FOREIGN KEY ("credential_id") REFERENCES "gv_cfg_tenant_credentials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_aud_tenant_logs" ADD CONSTRAINT "gv_aud_tenant_logs_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "gv_aud_tenant_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_menus" ADD CONSTRAINT "gv_cfg_menus_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "gv_cfg_menus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_ip_access_rules" ADD CONSTRAINT "gv_cfg_ip_access_rules_security_policy_id_fkey" FOREIGN KEY ("security_policy_id") REFERENCES "gv_cfg_security_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_terminology_overrides" ADD CONSTRAINT "gv_cfg_terminology_overrides_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "gv_usr_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_lic_subscriptions" ADD CONSTRAINT "gv_lic_subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "gv_usr_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_lic_subscriptions" ADD CONSTRAINT "gv_lic_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "gv_lic_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_lic_tenant_invoices" ADD CONSTRAINT "gv_lic_tenant_invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "gv_usr_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_lic_tenant_usage" ADD CONSTRAINT "gv_lic_tenant_usage_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "gv_usr_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_lic_plan_limits" ADD CONSTRAINT "gv_lic_plan_limits_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "gv_lic_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_lic_plan_module_access" ADD CONSTRAINT "gv_lic_plan_module_access_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "gv_lic_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_usr_users" ADD CONSTRAINT "gv_usr_users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "gv_usr_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_usr_users" ADD CONSTRAINT "gv_usr_users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "gv_usr_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_usr_users" ADD CONSTRAINT "gv_usr_users_designation_id_fkey" FOREIGN KEY ("designation_id") REFERENCES "gv_usr_designations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_usr_users" ADD CONSTRAINT "gv_usr_users_reporting_to_id_fkey" FOREIGN KEY ("reporting_to_id") REFERENCES "gv_usr_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_usr_customer_profiles" ADD CONSTRAINT "gv_usr_customer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "gv_usr_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_usr_referral_partners" ADD CONSTRAINT "gv_usr_referral_partners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "gv_usr_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_usr_departments" ADD CONSTRAINT "gv_usr_departments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "gv_usr_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_usr_departments" ADD CONSTRAINT "gv_usr_departments_head_user_id_fkey" FOREIGN KEY ("head_user_id") REFERENCES "gv_usr_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_usr_designations" ADD CONSTRAINT "gv_usr_designations_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "gv_usr_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_usr_designations" ADD CONSTRAINT "gv_usr_designations_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "gv_usr_designations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_usr_role_permissions" ADD CONSTRAINT "gv_usr_role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "gv_usr_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_usr_role_permissions" ADD CONSTRAINT "gv_usr_role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "gv_usr_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_usr_role_menu_permissions" ADD CONSTRAINT "gv_usr_role_menu_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "gv_usr_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_usr_role_menu_permissions" ADD CONSTRAINT "gv_usr_role_menu_permissions_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "gv_cfg_menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_usr_capacities" ADD CONSTRAINT "gv_usr_capacities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "gv_usr_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_usr_permission_overrides" ADD CONSTRAINT "gv_usr_permission_overrides_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "gv_usr_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_usr_tenant_profiles" ADD CONSTRAINT "gv_usr_tenant_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "gv_usr_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_usr_customer_users" ADD CONSTRAINT "gv_usr_customer_users_menu_category_id_fkey" FOREIGN KEY ("menu_category_id") REFERENCES "gv_cfg_customer_menu_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

