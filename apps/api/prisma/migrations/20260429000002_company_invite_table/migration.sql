-- Migration: 20260429000002_company_invite_table
-- Creates gv_cmp_company_invites table for the Invite System (Sprint 5.5)
-- DO NOT apply automatically — run manually via prisma migrate deploy on IdentityDB

CREATE TABLE IF NOT EXISTS "gv_cmp_company_invites" (
  "id"                  TEXT NOT NULL,
  "company_id"          TEXT NOT NULL,
  "invited_by_user_id"  TEXT NOT NULL,
  "invitee_email"       TEXT,
  "role"                TEXT NOT NULL DEFAULT 'MEMBER',
  "token"               TEXT NOT NULL,
  "status"              TEXT NOT NULL DEFAULT 'PENDING',
  "expires_at"          TIMESTAMP(3) NOT NULL,
  "accepted_at"         TIMESTAMP(3),
  "accepted_by_user_id" TEXT,
  "personal_message"    TEXT,
  "sent_via"            TEXT NOT NULL DEFAULT 'EMAIL',
  "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"          TIMESTAMP(3) NOT NULL,

  CONSTRAINT "gv_cmp_company_invites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "gv_cmp_company_invites_token_key"
  ON "gv_cmp_company_invites"("token");

CREATE INDEX IF NOT EXISTS "gv_cmp_company_invites_company_id_idx"
  ON "gv_cmp_company_invites"("company_id");

CREATE INDEX IF NOT EXISTS "gv_cmp_company_invites_invitee_email_idx"
  ON "gv_cmp_company_invites"("invitee_email");

CREATE INDEX IF NOT EXISTS "gv_cmp_company_invites_token_idx"
  ON "gv_cmp_company_invites"("token");

CREATE INDEX IF NOT EXISTS "gv_cmp_company_invites_status_idx"
  ON "gv_cmp_company_invites"("status");
