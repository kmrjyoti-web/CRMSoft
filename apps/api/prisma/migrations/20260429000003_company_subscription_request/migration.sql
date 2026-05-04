-- Migration: 20260429000003_company_subscription_request
-- Creates gv_cmp_subscription_requests for Company→Company approval (Sprint 5.5)
-- DO NOT apply automatically — run manually via prisma migrate deploy on IdentityDB

CREATE TABLE IF NOT EXISTS "gv_cmp_subscription_requests" (
  "id"                    TEXT NOT NULL,
  "requester_company_id"  TEXT NOT NULL,
  "target_company_id"     TEXT NOT NULL,
  "requester_user_id"     TEXT NOT NULL,
  "status"                TEXT NOT NULL DEFAULT 'PENDING',
  "reason"                TEXT,
  "rejection_reason"      TEXT,
  "reviewed_by_user_id"   TEXT,
  "reviewed_at"           TIMESTAMP(3),
  "created_at"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"            TIMESTAMP(3) NOT NULL,

  CONSTRAINT "gv_cmp_subscription_requests_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "gv_cmp_subscription_requests_unique" UNIQUE ("requester_company_id", "target_company_id")
);

CREATE INDEX IF NOT EXISTS "gv_cmp_subscription_requests_target_status_idx"
  ON "gv_cmp_subscription_requests"("target_company_id", "status");

CREATE INDEX IF NOT EXISTS "gv_cmp_subscription_requests_requester_idx"
  ON "gv_cmp_subscription_requests"("requester_company_id");
