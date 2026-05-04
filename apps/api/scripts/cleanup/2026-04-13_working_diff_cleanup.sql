-- DropForeignKey
ALTER TABLE "_deprecated_audit_field_changes" DROP CONSTRAINT "audit_field_changes_audit_log_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_bank_branches" DROP CONSTRAINT "bank_branches_bank_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_coupon_redemptions" DROP CONSTRAINT "coupon_redemptions_coupon_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_credential_access_logs" DROP CONSTRAINT "credential_access_logs_credential_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_industry_packages" DROP CONSTRAINT "industry_packages_industry_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_industry_packages" DROP CONSTRAINT "industry_packages_package_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_industry_patches" DROP CONSTRAINT "industry_patches_version_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_ip_access_rules" DROP CONSTRAINT "ip_access_rules_security_policy_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_license_keys" DROP CONSTRAINT "license_keys_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_listing_analytics" DROP CONSTRAINT "listing_analytics_listing_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_listing_price_tiers" DROP CONSTRAINT "listing_price_tiers_listing_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_marketplace_enquiries" DROP CONSTRAINT "marketplace_enquiries_listing_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_marketplace_order_items" DROP CONSTRAINT "marketplace_order_items_listing_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_marketplace_order_items" DROP CONSTRAINT "marketplace_order_items_order_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_marketplace_reviews" DROP CONSTRAINT "marketplace_reviews_module_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_plan_limits" DROP CONSTRAINT "plan_limits_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_plan_module_access" DROP CONSTRAINT "plan_module_access_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_post_analytics" DROP CONSTRAINT "post_analytics_post_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_post_engagements" DROP CONSTRAINT "post_engagements_post_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_role_menu_permissions" DROP CONSTRAINT "role_menu_permissions_menu_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_role_menu_permissions" DROP CONSTRAINT "role_menu_permissions_role_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_tenant_activity_logs" DROP CONSTRAINT "tenant_activity_logs_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_tenant_audit_logs" DROP CONSTRAINT "tenant_audit_logs_session_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_tenant_invoices" DROP CONSTRAINT "tenant_invoices_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_tenant_marketplace_modules" DROP CONSTRAINT "tenant_marketplace_modules_module_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_tenant_marketplace_modules" DROP CONSTRAINT "tenant_marketplace_modules_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_tenant_modules" DROP CONSTRAINT "tenant_modules_module_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_tenant_modules" DROP CONSTRAINT "tenant_modules_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_tenant_plugins" DROP CONSTRAINT "tenant_plugins_plugin_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_tenant_versions" DROP CONSTRAINT "tenant_versions_version_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_terminology_overrides" DROP CONSTRAINT "terminology_overrides_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_user_capacities" DROP CONSTRAINT "user_capacities_user_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_user_permission_overrides" DROP CONSTRAINT "user_permission_overrides_user_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_version_backups" DROP CONSTRAINT "version_backups_version_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_wallet_transactions" DROP CONSTRAINT "wallet_transactions_wallet_id_fkey";

-- DropForeignKey
ALTER TABLE "approval_requests" DROP CONSTRAINT "approval_requests_checker_id_fkey";

-- DropForeignKey
ALTER TABLE "approval_requests" DROP CONSTRAINT "approval_requests_maker_id_fkey";

-- DropForeignKey
ALTER TABLE "blocked_slots" DROP CONSTRAINT "blocked_slots_user_id_fkey";

-- DropForeignKey
ALTER TABLE "bom_formula_items" DROP CONSTRAINT "bom_formula_items_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "calendar_events" DROP CONSTRAINT "calendar_events_user_id_fkey";

-- DropForeignKey
ALTER TABLE "cities" DROP CONSTRAINT "cities_state_id_fkey";

-- DropForeignKey
ALTER TABLE "cloud_connections" DROP CONSTRAINT "cloud_connections_user_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_author_id_fkey";

-- DropForeignKey
ALTER TABLE "contact_filters" DROP CONSTRAINT "contact_filters_lookup_value_id_fkey";

-- DropForeignKey
ALTER TABLE "countries" DROP CONSTRAINT "countries_currency_id_fkey";

-- DropForeignKey
ALTER TABLE "coupons" DROP CONSTRAINT "coupons_package_id_fkey";

-- DropForeignKey
ALTER TABLE "customer_profiles" DROP CONSTRAINT "customer_profiles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "data_masking_policies" DROP CONSTRAINT "data_masking_policies_role_id_fkey";

-- DropForeignKey
ALTER TABLE "data_masking_policies" DROP CONSTRAINT "data_masking_policies_user_id_fkey";

-- DropForeignKey
ALTER TABLE "debit_note_items" DROP CONSTRAINT "debit_note_items_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "delivery_challan_items" DROP CONSTRAINT "delivery_challan_items_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "demos" DROP CONSTRAINT "demos_conducted_by_id_fkey";

-- DropForeignKey
ALTER TABLE "departments" DROP CONSTRAINT "departments_head_user_id_fkey";

-- DropForeignKey
ALTER TABLE "departments" DROP CONSTRAINT "departments_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "designations" DROP CONSTRAINT "designations_department_id_fkey";

-- DropForeignKey
ALTER TABLE "designations" DROP CONSTRAINT "designations_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "document_activities" DROP CONSTRAINT "document_activities_user_id_fkey";

-- DropForeignKey
ALTER TABLE "document_attachments" DROP CONSTRAINT "document_attachments_attached_by_id_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_uploaded_by_id_fkey";

-- DropForeignKey
ALTER TABLE "email_accounts" DROP CONSTRAINT "email_accounts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "email_signatures" DROP CONSTRAINT "email_signatures_user_id_fkey";

-- DropForeignKey
ALTER TABLE "entity_owners" DROP CONSTRAINT "entity_owners_assigned_by_id_fkey";

-- DropForeignKey
ALTER TABLE "entity_owners" DROP CONSTRAINT "entity_owners_user_id_fkey";

-- DropForeignKey
ALTER TABLE "event_history" DROP CONSTRAINT "event_history_changed_by_id_fkey";

-- DropForeignKey
ALTER TABLE "event_participants" DROP CONSTRAINT "event_participants_user_id_fkey";

-- DropForeignKey
ALTER TABLE "follow_ups" DROP CONSTRAINT "follow_ups_assigned_to_id_fkey";

-- DropForeignKey
ALTER TABLE "goods_receipt_items" DROP CONSTRAINT "goods_receipt_items_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "lead_filters" DROP CONSTRAINT "lead_filters_lookup_value_id_fkey";

-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_allocated_to_id_fkey";

-- DropForeignKey
ALTER TABLE "lookup_values" DROP CONSTRAINT "lookup_values_lookup_id_fkey";

-- DropForeignKey
ALTER TABLE "lookup_values" DROP CONSTRAINT "lookup_values_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "marketplace_modules" DROP CONSTRAINT "marketplace_modules_vendor_id_fkey";

-- DropForeignKey
ALTER TABLE "menus" DROP CONSTRAINT "menus_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "notification_preferences" DROP CONSTRAINT "notification_preferences_user_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_recipient_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_filters" DROP CONSTRAINT "organization_filters_lookup_value_id_fkey";

-- DropForeignKey
ALTER TABLE "ownership_logs" DROP CONSTRAINT "ownership_logs_changed_by_id_fkey";

-- DropForeignKey
ALTER TABLE "ownership_logs" DROP CONSTRAINT "ownership_logs_from_user_id_fkey";

-- DropForeignKey
ALTER TABLE "ownership_logs" DROP CONSTRAINT "ownership_logs_to_user_id_fkey";

-- DropForeignKey
ALTER TABLE "package_modules" DROP CONSTRAINT "package_modules_module_id_fkey";

-- DropForeignKey
ALTER TABLE "package_modules" DROP CONSTRAINT "package_modules_package_id_fkey";

-- DropForeignKey
ALTER TABLE "pincodes" DROP CONSTRAINT "pincodes_city_id_fkey";

-- DropForeignKey
ALTER TABLE "post_comments" DROP CONSTRAINT "post_comments_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "post_comments" DROP CONSTRAINT "post_comments_post_id_fkey";

-- DropForeignKey
ALTER TABLE "product_filters" DROP CONSTRAINT "product_filters_lookup_value_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_invoice_items" DROP CONSTRAINT "purchase_invoice_items_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_order_items" DROP CONSTRAINT "purchase_order_items_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_quotation_items" DROP CONSTRAINT "purchase_quotation_items_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_rfq_items" DROP CONSTRAINT "purchase_rfq_items_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "push_subscriptions" DROP CONSTRAINT "push_subscriptions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "quiet_hour_configs" DROP CONSTRAINT "quiet_hour_configs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "raw_contact_filters" DROP CONSTRAINT "raw_contact_filters_lookup_value_id_fkey";

-- DropForeignKey
ALTER TABLE "raw_contacts" DROP CONSTRAINT "raw_contacts_verified_by_id_fkey";

-- DropForeignKey
ALTER TABLE "referral_partners" DROP CONSTRAINT "referral_partners_user_id_fkey";

-- DropForeignKey
ALTER TABLE "reminders" DROP CONSTRAINT "reminders_recipient_id_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_role_id_fkey";

-- DropForeignKey
ALTER TABLE "sale_order_items" DROP CONSTRAINT "sale_order_items_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "sale_return_items" DROP CONSTRAINT "sale_return_items_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "scheduled_events" DROP CONSTRAINT "scheduled_events_organizer_id_fkey";

-- DropForeignKey
ALTER TABLE "states" DROP CONSTRAINT "states_country_id_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "table_configs" DROP CONSTRAINT "table_configs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "task_history" DROP CONSTRAINT "task_history_changed_by_id_fkey";

-- DropForeignKey
ALTER TABLE "task_watchers" DROP CONSTRAINT "task_watchers_user_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_assigned_to_id_fkey";

-- DropForeignKey
ALTER TABLE "tenant_profiles" DROP CONSTRAINT "tenant_profiles_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "tenant_usage" DROP CONSTRAINT "tenant_usage_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "tenants" DROP CONSTRAINT "tenants_business_type_id_fkey";

-- DropForeignKey
ALTER TABLE "tour_plans" DROP CONSTRAINT "tour_plans_sales_person_id_fkey";

-- DropForeignKey
ALTER TABLE "unmask_audit_logs" DROP CONSTRAINT "unmask_audit_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_availability" DROP CONSTRAINT "user_availability_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_calendar_syncs" DROP CONSTRAINT "user_calendar_syncs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_department_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_designation_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_reporting_to_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

-- DropForeignKey
ALTER TABLE "wa_conversations" DROP CONSTRAINT "wa_conversations_assigned_to_id_fkey";

-- AlterTable
ALTER TABLE "activities" DROP COLUMN "vertical_data";

-- AlterTable
ALTER TABLE "demos" DROP COLUMN "vertical_data";

-- AlterTable
ALTER TABLE "follow_ups" DROP COLUMN "vertical_data";

-- AlterTable
ALTER TABLE "leads" ALTER COLUMN "vertical_data" SET DEFAULT '{}';

-- AlterTable
ALTER TABLE "proforma_invoices" DROP COLUMN "vertical_data";

-- AlterTable
ALTER TABLE "quotations" DROP COLUMN "vertical_data";

-- AlterTable
ALTER TABLE "raw_contacts" DROP COLUMN "vertical_data";

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "vertical_data";

-- AlterTable
ALTER TABLE "tour_plans" DROP COLUMN "vertical_data";

-- AlterTable
ALTER TABLE "verification_invites" DROP CONSTRAINT "verification_invites_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "tenant_id" SET DATA TYPE TEXT,
ALTER COLUMN "source_entity_id" SET DATA TYPE TEXT,
ALTER COLUMN "sender_user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "verification_invites_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "_deprecated_audit_field_changes";

-- DropTable
DROP TABLE "_deprecated_audit_retention_policies";

-- DropTable
DROP TABLE "_deprecated_bank_branches";

-- DropTable
DROP TABLE "_deprecated_coupon_redemptions";

-- DropTable
DROP TABLE "_deprecated_credential_access_logs";

-- DropTable
DROP TABLE "_deprecated_data_retention_policies";

-- DropTable
DROP TABLE "_deprecated_delegation_records";

-- DropTable
DROP TABLE "_deprecated_error_catalog";

-- DropTable
DROP TABLE "_deprecated_global_default_credentials";

-- DropTable
DROP TABLE "_deprecated_global_lookups";

-- DropTable
DROP TABLE "_deprecated_help_articles";

-- DropTable
DROP TABLE "_deprecated_hsn_sac_codes";

-- DropTable
DROP TABLE "_deprecated_industry_packages";

-- DropTable
DROP TABLE "_deprecated_industry_patches";

-- DropTable
DROP TABLE "_deprecated_ip_access_rules";

-- DropTable
DROP TABLE "_deprecated_license_keys";

-- DropTable
DROP TABLE "_deprecated_listing_analytics";

-- DropTable
DROP TABLE "_deprecated_listing_price_tiers";

-- DropTable
DROP TABLE "_deprecated_marketplace_enquiries";

-- DropTable
DROP TABLE "_deprecated_marketplace_order_items";

-- DropTable
DROP TABLE "_deprecated_marketplace_reviews";

-- DropTable
DROP TABLE "_deprecated_plan_limits";

-- DropTable
DROP TABLE "_deprecated_plan_module_access";

-- DropTable
DROP TABLE "_deprecated_plugin_hook_logs";

-- DropTable
DROP TABLE "_deprecated_post_analytics";

-- DropTable
DROP TABLE "_deprecated_post_engagements";

-- DropTable
DROP TABLE "_deprecated_recharge_plans";

-- DropTable
DROP TABLE "_deprecated_role_menu_permissions";

-- DropTable
DROP TABLE "_deprecated_software_offers";

-- DropTable
DROP TABLE "_deprecated_tenant_activity_logs";

-- DropTable
DROP TABLE "_deprecated_tenant_audit_logs";

-- DropTable
DROP TABLE "_deprecated_tenant_brandings";

-- DropTable
DROP TABLE "_deprecated_tenant_invoices";

-- DropTable
DROP TABLE "_deprecated_tenant_marketplace_modules";

-- DropTable
DROP TABLE "_deprecated_tenant_modules";

-- DropTable
DROP TABLE "_deprecated_tenant_plugins";

-- DropTable
DROP TABLE "_deprecated_tenant_usage_details";

-- DropTable
DROP TABLE "_deprecated_tenant_versions";

-- DropTable
DROP TABLE "_deprecated_terminology_overrides";

-- DropTable
DROP TABLE "_deprecated_user_capacities";

-- DropTable
DROP TABLE "_deprecated_user_permission_overrides";

-- DropTable
DROP TABLE "_deprecated_verification_otps";

-- DropTable
DROP TABLE "_deprecated_version_backups";

-- DropTable
DROP TABLE "_deprecated_wallet_transactions";

-- DropTable
DROP TABLE "app_versions";

-- DropTable
DROP TABLE "audit_logs";

-- DropTable
DROP TABLE "banks";

-- DropTable
DROP TABLE "business_type_registry";

-- DropTable
DROP TABLE "cities";

-- DropTable
DROP TABLE "countries";

-- DropTable
DROP TABLE "coupons";

-- DropTable
DROP TABLE "currencies";

-- DropTable
DROP TABLE "customer_profiles";

-- DropTable
DROP TABLE "departments";

-- DropTable
DROP TABLE "designations";

-- DropTable
DROP TABLE "error_auto_report_rules";

-- DropTable
DROP TABLE "error_logs";

-- DropTable
DROP TABLE "gst_rates";

-- DropTable
DROP TABLE "languages";

-- DropTable
DROP TABLE "lookup_values";

-- DropTable
DROP TABLE "marketplace_listings";

-- DropTable
DROP TABLE "marketplace_modules";

-- DropTable
DROP TABLE "marketplace_orders";

-- DropTable
DROP TABLE "marketplace_posts";

-- DropTable
DROP TABLE "marketplace_vendors";

-- DropTable
DROP TABLE "master_lookups";

-- DropTable
DROP TABLE "menus";

-- DropTable
DROP TABLE "module_definitions";

-- DropTable
DROP TABLE "package_modules";

-- DropTable
DROP TABLE "packages";

-- DropTable
DROP TABLE "page_registry";

-- DropTable
DROP TABLE "permission_templates";

-- DropTable
DROP TABLE "permissions";

-- DropTable
DROP TABLE "pincodes";

-- DropTable
DROP TABLE "plans";

-- DropTable
DROP TABLE "plugin_registry";

-- DropTable
DROP TABLE "post_comments";

-- DropTable
DROP TABLE "referral_partners";

-- DropTable
DROP TABLE "role_permissions";

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "security_policies";

-- DropTable
DROP TABLE "states";

-- DropTable
DROP TABLE "subscription_packages";

-- DropTable
DROP TABLE "subscriptions";

-- DropTable
DROP TABLE "super_admins";

-- DropTable
DROP TABLE "tenant_audit_sessions";

-- DropTable
DROP TABLE "tenant_configs";

-- DropTable
DROP TABLE "tenant_credentials";

-- DropTable
DROP TABLE "tenant_profiles";

-- DropTable
DROP TABLE "tenant_usage";

-- DropTable
DROP TABLE "tenants";

-- DropTable
DROP TABLE "timezones";

-- DropTable
DROP TABLE "users";

-- DropTable
DROP TABLE "wallets";

-- DropEnum
DROP TYPE "AuditAction";

-- DropEnum
DROP TYPE "AuditEntityType";

-- DropEnum
DROP TYPE "AuditSessionStatus";

-- DropEnum
DROP TYPE "ConfigCategory";

-- DropEnum
DROP TYPE "ConfigValueType";

-- DropEnum
DROP TYPE "CouponType";

-- DropEnum
DROP TYPE "CredentialProvider";

-- DropEnum
DROP TYPE "CredentialStatus";

-- DropEnum
DROP TYPE "CredentialValidationStatus";

-- DropEnum
DROP TYPE "DbStrategy";

-- DropEnum
DROP TYPE "DiscountType";

-- DropEnum
DROP TYPE "EngagementAction";

-- DropEnum
DROP TYPE "EnquiryStatus";

-- DropEnum
DROP TYPE "ErrorLayer";

-- DropEnum
DROP TYPE "ErrorSeverity";

-- DropEnum
DROP TYPE "ExpiryAction";

-- DropEnum
DROP TYPE "FeatureFlag";

-- DropEnum
DROP TYPE "HelpType";

-- DropEnum
DROP TYPE "HsnSacType";

-- DropEnum
DROP TYPE "IndustryCategory";

-- DropEnum
DROP TYPE "IpRuleType";

-- DropEnum
DROP TYPE "LicenseStatus";

-- DropEnum
DROP TYPE "LimitType";

-- DropEnum
DROP TYPE "ListingStatus";

-- DropEnum
DROP TYPE "ListingType";

-- DropEnum
DROP TYPE "MarketplaceInstallStatus";

-- DropEnum
DROP TYPE "MarketplaceModuleStatus";

-- DropEnum
DROP TYPE "MktOrderStatus";

-- DropEnum
DROP TYPE "MktPaymentStatus";

-- DropEnum
DROP TYPE "ModuleAccessLevel";

-- DropEnum
DROP TYPE "ModuleCategory";

-- DropEnum
DROP TYPE "ModulePricingType";

-- DropEnum
DROP TYPE "ModuleStatus";

-- DropEnum
DROP TYPE "OfferType";

-- DropEnum
DROP TYPE "OnboardingStep";

-- DropEnum
DROP TYPE "OtpPurpose";

-- DropEnum
DROP TYPE "OtpStatus";

-- DropEnum
DROP TYPE "PatchStatus";

-- DropEnum
DROP TYPE "PlanInterval";

-- DropEnum
DROP TYPE "PluginCategory";

-- DropEnum
DROP TYPE "PluginStatus";

-- DropEnum
DROP TYPE "PostStatus";

-- DropEnum
DROP TYPE "PostType";

-- DropEnum
DROP TYPE "RegistrationType";

-- DropEnum
DROP TYPE "RetentionAction";

-- DropEnum
DROP TYPE "SubscriptionStatus";

-- DropEnum
DROP TYPE "TenantAuditActionType";

-- DropEnum
DROP TYPE "TenantModuleStatus";

-- DropEnum
DROP TYPE "TenantPluginStatus";

-- DropEnum
DROP TYPE "TenantStatus";

-- DropEnum
DROP TYPE "UserStatus";

-- DropEnum
DROP TYPE "UserType";

-- DropEnum
DROP TYPE "VendorStatus";

-- DropEnum
DROP TYPE "VerificationStatus";

-- DropEnum
DROP TYPE "VersionStatus";

-- DropEnum
DROP TYPE "VisibilityType";

-- DropEnum
DROP TYPE "WalletTxnStatus";

-- DropEnum
DROP TYPE "WalletTxnType";

-- CreateTable
CREATE TABLE "saved_filters" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "entity_type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "filter_config" JSONB NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_shared" BOOLEAN NOT NULL DEFAULT false,
    "shared_with_roles" JSONB,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "last_used_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_filters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_lists" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "valid_from" TIMESTAMP(3),
    "valid_to" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_list_items" (
    "id" TEXT NOT NULL,
    "price_list_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "selling_price" DECIMAL(14,2) NOT NULL,
    "min_quantity" INTEGER NOT NULL DEFAULT 1,
    "max_quantity" INTEGER,
    "margin_percent" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_filters_tenant_id_entity_type_idx" ON "saved_filters"("tenant_id", "entity_type");

-- CreateIndex
CREATE INDEX "saved_filters_tenant_id_created_by_id_idx" ON "saved_filters"("tenant_id", "created_by_id");

-- CreateIndex
CREATE INDEX "saved_filters_is_deleted_idx" ON "saved_filters"("is_deleted");

-- CreateIndex
CREATE INDEX "price_lists_tenant_id_idx" ON "price_lists"("tenant_id");

-- CreateIndex
CREATE INDEX "price_lists_tenant_id_is_active_idx" ON "price_lists"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "price_lists_is_deleted_idx" ON "price_lists"("is_deleted");

-- CreateIndex
CREATE INDEX "price_list_items_price_list_id_idx" ON "price_list_items"("price_list_id");

-- CreateIndex
CREATE INDEX "price_list_items_product_id_idx" ON "price_list_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "price_list_items_price_list_id_product_id_min_quantity_key" ON "price_list_items"("price_list_id", "product_id", "min_quantity");

-- AddForeignKey
ALTER TABLE "price_list_items" ADD CONSTRAINT "price_list_items_price_list_id_fkey" FOREIGN KEY ("price_list_id") REFERENCES "price_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

