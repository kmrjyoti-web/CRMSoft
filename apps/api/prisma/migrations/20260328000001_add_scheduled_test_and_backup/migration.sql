-- Migration: Add Scheduled Tests, Scheduled Test Runs, Database Backup Records
-- Also: Add reportedToProvider fields to error_logs

-- ─── scheduled_tests ───
CREATE TABLE IF NOT EXISTS "scheduled_tests" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cron_expression" TEXT NOT NULL,
    "target_modules" TEXT[] NOT NULL DEFAULT '{}',
    "test_types" TEXT[] NOT NULL DEFAULT '{}',
    "db_source_type" TEXT NOT NULL DEFAULT 'BACKUP_RESTORE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_run_at" TIMESTAMP(3),
    "next_run_at" TIMESTAMP(3),
    "last_run_status" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_id" TEXT NOT NULL,

    CONSTRAINT "scheduled_tests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "scheduled_tests_tenant_id_idx" ON "scheduled_tests"("tenant_id");
CREATE INDEX IF NOT EXISTS "scheduled_tests_tenant_id_is_active_idx" ON "scheduled_tests"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "scheduled_tests_next_run_at_idx" ON "scheduled_tests"("next_run_at");

-- ─── scheduled_test_runs ───
CREATE TABLE IF NOT EXISTS "scheduled_test_runs" (
    "id" TEXT NOT NULL,
    "scheduled_test_id" TEXT NOT NULL,
    "test_run_id" TEXT,
    "backup_record_id" TEXT,
    "test_env_id" TEXT,
    "status" TEXT NOT NULL,
    "error_message" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "scheduled_test_runs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "scheduled_test_runs_scheduled_test_id_idx" ON "scheduled_test_runs"("scheduled_test_id");
CREATE INDEX IF NOT EXISTS "scheduled_test_runs_scheduled_test_id_status_idx" ON "scheduled_test_runs"("scheduled_test_id", "status");

ALTER TABLE "scheduled_test_runs"
    ADD CONSTRAINT "scheduled_test_runs_scheduled_test_id_fkey"
    FOREIGN KEY ("scheduled_test_id") REFERENCES "scheduled_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── database_backup_records ───
CREATE TABLE IF NOT EXISTS "database_backup_records" (
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

    CONSTRAINT "database_backup_records_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "database_backup_records_tenant_id_idx" ON "database_backup_records"("tenant_id");
CREATE INDEX IF NOT EXISTS "database_backup_records_tenant_id_is_validated_idx" ON "database_backup_records"("tenant_id", "is_validated");
CREATE INDEX IF NOT EXISTS "database_backup_records_tenant_id_created_at_idx" ON "database_backup_records"("tenant_id", "created_at");

-- ─── error_logs: Add reportedToProvider fields ───
ALTER TABLE "error_logs"
    ADD COLUMN IF NOT EXISTS "reported_to_provider" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "reported_to_provider_at" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "reported_to_provider_by_id" TEXT;
