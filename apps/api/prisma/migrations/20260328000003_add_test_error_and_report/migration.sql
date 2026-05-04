-- CreateEnum (safe — skip if exists)
DO $$ BEGIN
  CREATE TYPE "TestErrorCategory" AS ENUM ('FUNCTIONAL', 'VALIDATION', 'DATABASE', 'UI_RENDER', 'API_CONTRACT', 'ARCHITECTURE', 'SECURITY', 'PERFORMANCE', 'CONFIGURATION', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "TestSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Ensure test_runs exists (OPS-2 dependency)
DO $$ BEGIN
  CREATE TYPE "TestRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "TestType" AS ENUM ('UNIT', 'FUNCTIONAL', 'SMOKE', 'INTEGRATION', 'ARCHITECTURE', 'PENETRATION');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "TestResultStatus" AS ENUM ('PASSED', 'FAILED', 'SKIPPED', 'ERROR');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "test_runs" (
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

    CONSTRAINT "test_runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "test_results" (
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

    CONSTRAINT "test_results_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "test_runs_tenant_id_idx" ON "test_runs"("tenant_id");
CREATE INDEX IF NOT EXISTS "test_runs_status_idx" ON "test_runs"("status");
CREATE INDEX IF NOT EXISTS "test_results_test_run_id_idx" ON "test_results"("test_run_id");

DO $$ BEGIN
  ALTER TABLE "test_results" ADD CONSTRAINT "test_results_test_run_id_fkey"
    FOREIGN KEY ("test_run_id") REFERENCES "test_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "test_error_logs" (
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

    CONSTRAINT "test_error_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "test_reports" (
    "id" TEXT NOT NULL,
    "test_run_id" TEXT NOT NULL,
    "summary" JSONB NOT NULL DEFAULT '{}',
    "category_results" JSONB NOT NULL DEFAULT '{}',
    "module_results" JSONB NOT NULL DEFAULT '{}',
    "error_summary" JSONB NOT NULL DEFAULT '{}',
    "recommendations" JSONB,
    "report_file_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "test_error_logs_test_run_id_idx" ON "test_error_logs"("test_run_id");
CREATE INDEX IF NOT EXISTS "test_error_logs_error_category_idx" ON "test_error_logs"("error_category");
CREATE INDEX IF NOT EXISTS "test_error_logs_severity_idx" ON "test_error_logs"("severity");
CREATE INDEX IF NOT EXISTS "test_error_logs_is_resolved_idx" ON "test_error_logs"("is_resolved");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "test_reports_test_run_id_key" ON "test_reports"("test_run_id");

-- AddColumn
ALTER TABLE "test_plan_items" ADD COLUMN IF NOT EXISTS "notion_block_id" TEXT;

-- AddForeignKey (safe)
DO $$ BEGIN
  ALTER TABLE "test_error_logs" ADD CONSTRAINT "test_error_logs_test_run_id_fkey"
    FOREIGN KEY ("test_run_id") REFERENCES "test_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "test_error_logs" ADD CONSTRAINT "test_error_logs_test_result_id_fkey"
    FOREIGN KEY ("test_result_id") REFERENCES "test_results"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "test_reports" ADD CONSTRAINT "test_reports_test_run_id_fkey"
    FOREIGN KEY ("test_run_id") REFERENCES "test_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
