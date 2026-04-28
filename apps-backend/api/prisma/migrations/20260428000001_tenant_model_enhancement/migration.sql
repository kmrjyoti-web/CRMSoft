-- Sprint 1 Item 2: Tenant Model Enhancement
-- Date: 2026-04-28
-- Target DB: identitydb (gv_usr_tenants + gv_usr_tenant_profiles)
--
-- Adds: subdomain, domainVerified, dbStrategy, encrypted DB connection fields,
--       dbRegion, planId, planCode, subscriptionStatus, partnerCode, brandCode,
--       editionCode, verticalCode, brandConfigHash, brandConfigGeneratedAt
-- Safe: all ADD COLUMN IF NOT EXISTS + DO $$ EXCEPTION guards

-- ══════════════════════════════════════════════════════════════
-- STEP 1: Add DbStrategy enum (already exists on TenantProfile
--         but guard against missing in fresh env)
-- ══════════════════════════════════════════════════════════════
DO $$ BEGIN
  CREATE TYPE "DbStrategy" AS ENUM ('SHARED', 'DEDICATED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ══════════════════════════════════════════════════════════════
-- STEP 2: gv_usr_tenants — new columns
-- ══════════════════════════════════════════════════════════════

-- Domain / routing
ALTER TABLE "gv_usr_tenants" ADD COLUMN IF NOT EXISTS "subdomain"       TEXT;
ALTER TABLE "gv_usr_tenants" ADD COLUMN IF NOT EXISTS "domain_verified" BOOLEAN NOT NULL DEFAULT false;

-- DB routing (hot-path for TenantResolverMiddleware)
ALTER TABLE "gv_usr_tenants" ADD COLUMN IF NOT EXISTS "db_strategy"             "DbStrategy" NOT NULL DEFAULT 'SHARED';
ALTER TABLE "gv_usr_tenants" ADD COLUMN IF NOT EXISTS "db_connection_encrypted" TEXT;
ALTER TABLE "gv_usr_tenants" ADD COLUMN IF NOT EXISTS "db_connection_iv"        TEXT;
ALTER TABLE "gv_usr_tenants" ADD COLUMN IF NOT EXISTS "db_connection_tag"       TEXT;
ALTER TABLE "gv_usr_tenants" ADD COLUMN IF NOT EXISTS "db_region"               TEXT DEFAULT 'ap-south-1';

-- Plan & subscription (denormalized for fast lookup)
ALTER TABLE "gv_usr_tenants" ADD COLUMN IF NOT EXISTS "plan_id"             TEXT;
ALTER TABLE "gv_usr_tenants" ADD COLUMN IF NOT EXISTS "plan_code"           TEXT;
ALTER TABLE "gv_usr_tenants" ADD COLUMN IF NOT EXISTS "subscription_status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING';

-- Brand / vertical identity
ALTER TABLE "gv_usr_tenants" ADD COLUMN IF NOT EXISTS "partner_code"  TEXT;
ALTER TABLE "gv_usr_tenants" ADD COLUMN IF NOT EXISTS "brand_code"    TEXT;
ALTER TABLE "gv_usr_tenants" ADD COLUMN IF NOT EXISTS "edition_code"  TEXT;
ALTER TABLE "gv_usr_tenants" ADD COLUMN IF NOT EXISTS "vertical_code" TEXT;

-- Brand config cache
ALTER TABLE "gv_usr_tenants" ADD COLUMN IF NOT EXISTS "brand_config_hash"         TEXT;
ALTER TABLE "gv_usr_tenants" ADD COLUMN IF NOT EXISTS "brand_config_generated_at" TIMESTAMP(3);

-- ══════════════════════════════════════════════════════════════
-- STEP 3: gv_usr_tenants — unique constraint + indexes
-- ══════════════════════════════════════════════════════════════

-- Unique subdomain (brand-scoped short domain)
DO $$ BEGIN
  ALTER TABLE "gv_usr_tenants" ADD CONSTRAINT "gv_usr_tenants_subdomain_key" UNIQUE ("subdomain");
EXCEPTION WHEN duplicate_table THEN null; END $$;

CREATE INDEX IF NOT EXISTS "gv_usr_tenants_subdomain_idx"
  ON "gv_usr_tenants" ("subdomain");

CREATE INDEX IF NOT EXISTS "gv_usr_tenants_brand_vertical_idx"
  ON "gv_usr_tenants" ("brand_code", "vertical_code");

CREATE INDEX IF NOT EXISTS "gv_usr_tenants_partner_code_idx"
  ON "gv_usr_tenants" ("partner_code");

CREATE INDEX IF NOT EXISTS "gv_usr_tenants_subscription_status_idx"
  ON "gv_usr_tenants" ("subscription_status");

-- ══════════════════════════════════════════════════════════════
-- STEP 4: gv_usr_tenant_profiles — encrypted connection fields
-- ══════════════════════════════════════════════════════════════
ALTER TABLE "gv_usr_tenant_profiles" ADD COLUMN IF NOT EXISTS "db_connection_encrypted" TEXT;
ALTER TABLE "gv_usr_tenant_profiles" ADD COLUMN IF NOT EXISTS "db_connection_iv"        TEXT;
ALTER TABLE "gv_usr_tenant_profiles" ADD COLUMN IF NOT EXISTS "db_connection_tag"       TEXT;
ALTER TABLE "gv_usr_tenant_profiles" ADD COLUMN IF NOT EXISTS "db_region"               TEXT DEFAULT 'ap-south-1';
