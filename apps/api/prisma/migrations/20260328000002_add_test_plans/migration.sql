-- Migration: add_test_plans
-- Adds TestPlan, TestPlanItem, TestEvidence models for structured manual QA checklists

-- ── Enums ────────────────────────────────────────────────────────────────────

CREATE TYPE "TestPlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');
CREATE TYPE "TestPlanItemStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'PASSED', 'FAILED', 'PARTIAL', 'BLOCKED', 'SKIPPED');
CREATE TYPE "TestPlanItemPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- ── TestPlan ─────────────────────────────────────────────────────────────────

CREATE TABLE "test_plans" (
    "id"               TEXT NOT NULL,
    "tenant_id"        TEXT NOT NULL,
    "name"             TEXT NOT NULL,
    "description"      TEXT,
    "version"          TEXT,
    "target_modules"   TEXT[] NOT NULL DEFAULT '{}',
    "status"           "TestPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "total_items"      INTEGER NOT NULL DEFAULT 0,
    "passed_items"     INTEGER NOT NULL DEFAULT 0,
    "failed_items"     INTEGER NOT NULL DEFAULT 0,
    "completed_items"  INTEGER NOT NULL DEFAULT 0,
    "progress"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notion_page_id"   TEXT,
    "notion_synced_at" TIMESTAMP(3),
    "is_active"        BOOLEAN NOT NULL DEFAULT true,
    "created_by_id"    TEXT NOT NULL,
    "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"       TIMESTAMP(3) NOT NULL,
    CONSTRAINT "test_plans_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "test_plans_tenant_id_idx" ON "test_plans"("tenant_id");
CREATE INDEX "test_plans_tenant_id_status_idx" ON "test_plans"("tenant_id", "status");

-- ── TestPlanItem ─────────────────────────────────────────────────────────────

CREATE TABLE "test_plan_items" (
    "id"              TEXT NOT NULL,
    "plan_id"         TEXT NOT NULL,
    "module_name"     TEXT NOT NULL,
    "component_name"  TEXT NOT NULL,
    "functionality"   TEXT NOT NULL,
    "layer"           TEXT NOT NULL,
    "priority"        "TestPlanItemPriority" NOT NULL DEFAULT 'MEDIUM',
    "status"          "TestPlanItemStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "tested_by_id"    TEXT,
    "tested_at"       TIMESTAMP(3),
    "notes"           TEXT,
    "error_details"   TEXT,
    "sort_order"      INTEGER NOT NULL DEFAULT 0,
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMP(3) NOT NULL,
    CONSTRAINT "test_plan_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "test_plan_items_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "test_plans"("id") ON DELETE CASCADE
);

CREATE INDEX "test_plan_items_plan_id_idx" ON "test_plan_items"("plan_id");
CREATE INDEX "test_plan_items_plan_id_status_idx" ON "test_plan_items"("plan_id", "status");
CREATE INDEX "test_plan_items_module_name_idx" ON "test_plan_items"("module_name");

-- ── TestEvidence ─────────────────────────────────────────────────────────────

CREATE TABLE "test_evidences" (
    "id"               TEXT NOT NULL,
    "plan_item_id"     TEXT NOT NULL,
    "file_type"        TEXT NOT NULL,
    "file_name"        TEXT NOT NULL,
    "file_path"        TEXT NOT NULL,
    "file_size"        INTEGER,
    "mime_type"        TEXT,
    "caption"          TEXT,
    "uploaded_by_id"   TEXT,
    "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "test_evidences_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "test_evidences_plan_item_id_fkey" FOREIGN KEY ("plan_item_id") REFERENCES "test_plan_items"("id") ON DELETE CASCADE
);

CREATE INDEX "test_evidences_plan_item_id_idx" ON "test_evidences"("plan_item_id");
