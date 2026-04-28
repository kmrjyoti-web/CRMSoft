-- Migration: 20260429000001_tenant_parent_hierarchy
-- Adds parent_tenant_id to gv_usr_tenants for WL hierarchy (Sprint 5.3)
-- DO NOT apply automatically — run manually via prisma migrate deploy on IdentityDB

ALTER TABLE "gv_usr_tenants" ADD COLUMN IF NOT EXISTS "parent_tenant_id" TEXT;

ALTER TABLE "gv_usr_tenants"
  ADD CONSTRAINT "gv_usr_tenants_parent_tenant_id_fkey"
  FOREIGN KEY ("parent_tenant_id") REFERENCES "gv_usr_tenants"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "gv_usr_tenants_parent_tenant_id_idx"
  ON "gv_usr_tenants"("parent_tenant_id");
