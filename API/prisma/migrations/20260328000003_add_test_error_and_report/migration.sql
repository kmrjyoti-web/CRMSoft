-- CreateEnum
CREATE TYPE "TestErrorCategory" AS ENUM ('FUNCTIONAL', 'VALIDATION', 'DATABASE', 'UI_RENDER', 'API_CONTRACT', 'ARCHITECTURE', 'SECURITY', 'PERFORMANCE', 'CONFIGURATION', 'OTHER');

-- CreateEnum
CREATE TYPE "TestSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "test_error_logs" (
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
CREATE TABLE "test_reports" (
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
CREATE INDEX "test_error_logs_test_run_id_idx" ON "test_error_logs"("test_run_id");
CREATE INDEX "test_error_logs_error_category_idx" ON "test_error_logs"("error_category");
CREATE INDEX "test_error_logs_severity_idx" ON "test_error_logs"("severity");
CREATE INDEX "test_error_logs_is_resolved_idx" ON "test_error_logs"("is_resolved");

-- CreateIndex
CREATE UNIQUE INDEX "test_reports_test_run_id_key" ON "test_reports"("test_run_id");

-- AddForeignKey
-- AddColumn
ALTER TABLE "test_plan_items" ADD COLUMN "notion_block_id" TEXT;

-- AddForeignKey
ALTER TABLE "test_error_logs" ADD CONSTRAINT "test_error_logs_test_run_id_fkey" FOREIGN KEY ("test_run_id") REFERENCES "test_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "test_error_logs" ADD CONSTRAINT "test_error_logs_test_result_id_fkey" FOREIGN KEY ("test_result_id") REFERENCES "test_results"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "test_reports" ADD CONSTRAINT "test_reports_test_run_id_fkey" FOREIGN KEY ("test_run_id") REFERENCES "test_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
