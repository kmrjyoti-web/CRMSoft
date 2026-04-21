-- CreateTable
CREATE TABLE "pc_error_global_logs" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT,
    "tenant_id" TEXT,
    "vertical_type" TEXT,
    "severity" TEXT NOT NULL,
    "error_code" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack_trace" TEXT,
    "module" TEXT,
    "component" TEXT,
    "endpoint" TEXT,
    "http_status" INTEGER,
    "request_context" JSONB,
    "user_id" TEXT,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "resolved_at" TIMESTAMP(3),
    "resolved_by" TEXT,
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pc_error_global_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_error_customer_reports" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "reported_by" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "error_code" TEXT,
    "screenshots" JSONB DEFAULT '[]',
    "browser_info" JSONB,
    "last_actions" JSONB DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "escalated_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pc_error_customer_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_error_escalations" (
    "id" TEXT NOT NULL,
    "error_log_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "customer_notes" TEXT,
    "brand_notes" TEXT,
    "developer_notes" TEXT,
    "auto_escalated" BOOLEAN NOT NULL DEFAULT false,
    "escalated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "pc_error_escalations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_error_auto_reports" (
    "id" TEXT NOT NULL,
    "rule_code" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "error_code" TEXT NOT NULL,
    "occurrences" INTEGER NOT NULL DEFAULT 1,
    "notified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notify_channel" TEXT NOT NULL,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "pc_error_auto_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_error_trends" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "period_date" TEXT NOT NULL,
    "brand_id" TEXT,
    "vertical_type" TEXT,
    "total_errors" INTEGER NOT NULL DEFAULT 0,
    "critical_count" INTEGER NOT NULL DEFAULT 0,
    "high_count" INTEGER NOT NULL DEFAULT 0,
    "resolved_count" INTEGER NOT NULL DEFAULT 0,
    "avg_resolution_ms" INTEGER,
    "top_errors" JSONB DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pc_error_trends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_alert_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "condition" JSONB NOT NULL,
    "channels" JSONB NOT NULL DEFAULT '["EMAIL"]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_triggered" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pc_alert_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_version_releases" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "vertical_type" TEXT,
    "release_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "release_notes" TEXT,
    "git_tag" TEXT,
    "git_commit_hash" TEXT,
    "released_at" TIMESTAMP(3),
    "released_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pc_version_releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_vertical_versions" (
    "id" TEXT NOT NULL,
    "vertical_type" TEXT NOT NULL,
    "current_version" TEXT NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modules_count" INTEGER,
    "endpoints_count" INTEGER,
    "health_status" TEXT NOT NULL DEFAULT 'HEALTHY',

    CONSTRAINT "pc_vertical_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_rollback_logs" (
    "id" TEXT NOT NULL,
    "from_version" TEXT NOT NULL,
    "to_version" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "rolled_back_by" TEXT NOT NULL,
    "rolled_back_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pc_rollback_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_vertical_registry" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_hi" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "schema_version" TEXT NOT NULL DEFAULT '1.0.0',
    "modules_count" INTEGER NOT NULL DEFAULT 0,
    "schemas_config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pc_vertical_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_vertical_audits" (
    "id" TEXT NOT NULL,
    "vertical_type" TEXT NOT NULL,
    "audit_date" TIMESTAMP(3) NOT NULL,
    "score" INTEGER NOT NULL,
    "metrics" JSONB NOT NULL,
    "issues" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pc_vertical_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_vertical_health" (
    "id" TEXT NOT NULL,
    "vertical_type" TEXT NOT NULL,
    "api_status" TEXT NOT NULL DEFAULT 'HEALTHY',
    "db_status" TEXT NOT NULL DEFAULT 'HEALTHY',
    "test_status" TEXT NOT NULL DEFAULT 'PASSING',
    "error_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_response_ms" INTEGER,
    "last_checked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pc_vertical_health_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_brand_module_whitelists" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "module_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ENABLED',
    "trial_expires_at" TIMESTAMP(3),
    "enabled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enabled_by" TEXT,

    CONSTRAINT "pc_brand_module_whitelists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_brand_feature_flags" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "feature_code" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB DEFAULT '{}',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pc_brand_feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_brand_error_summaries" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "total_errors" INTEGER NOT NULL DEFAULT 0,
    "critical_count" INTEGER NOT NULL DEFAULT 0,
    "resolved_count" INTEGER NOT NULL DEFAULT 0,
    "top_modules" JSONB DEFAULT '[]',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pc_brand_error_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_health_snapshots" (
    "id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "response_time_ms" INTEGER,
    "metrics" JSONB,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pc_health_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_alert_history" (
    "id" TEXT NOT NULL,
    "rule_id" TEXT,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "acknowledged_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pc_alert_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_incident_logs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "affected_service" TEXT NOT NULL,
    "root_cause" TEXT,
    "resolution" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "postmortem" TEXT,

    CONSTRAINT "pc_incident_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_notification_logs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pc_notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_dr_plans" (
    "id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "runbook" TEXT NOT NULL,
    "rto" INTEGER NOT NULL,
    "rpo" INTEGER NOT NULL,
    "last_tested" TIMESTAMP(3),
    "last_incident" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pc_dr_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_deployment_logs" (
    "id" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "git_branch" TEXT NOT NULL,
    "git_commit_hash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DEPLOYING',
    "deployed_by" TEXT NOT NULL,
    "duration" INTEGER,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "error_message" TEXT,

    CONSTRAINT "pc_deployment_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_pipeline_runs" (
    "id" TEXT NOT NULL,
    "pipeline_name" TEXT NOT NULL,
    "trigger_type" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "jobs" JSONB NOT NULL DEFAULT '[]',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "pc_pipeline_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_build_logs" (
    "id" TEXT NOT NULL,
    "pipeline_run_id" TEXT,
    "job_name" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "exit_code" INTEGER,
    "duration" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pc_build_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_menu_global_configs" (
    "id" TEXT NOT NULL,
    "menu_key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "label_hi" TEXT NOT NULL,
    "icon" TEXT,
    "parent_key" TEXT,
    "route" TEXT,
    "module_code" TEXT,
    "vertical_type" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pc_menu_global_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_menu_brand_overrides" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "menu_key" TEXT NOT NULL,
    "custom_label" TEXT,
    "custom_icon" TEXT,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER,

    CONSTRAINT "pc_menu_brand_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_test_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "module_scope" TEXT,
    "vertical_scope" TEXT,
    "scenarios" JSONB NOT NULL DEFAULT '[]',
    "created_by" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pc_test_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_test_schedules" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT,
    "schedule_type" TEXT NOT NULL,
    "cron_expression" TEXT,
    "module_scope" TEXT,
    "vertical_scope" TEXT,
    "brand_scope" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_run" TIMESTAMP(3),
    "next_run" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pc_test_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_test_executions" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT,
    "schedule_id" TEXT,
    "trigger_type" TEXT NOT NULL,
    "module_scope" TEXT,
    "vertical_scope" TEXT,
    "total_tests" INTEGER NOT NULL DEFAULT 0,
    "passed" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "skipped" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER,
    "coverage" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "output" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "pc_test_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_test_coverages" (
    "id" TEXT NOT NULL,
    "module_name" TEXT NOT NULL,
    "vertical_type" TEXT,
    "spec_file_count" INTEGER NOT NULL DEFAULT 0,
    "total_tests" INTEGER NOT NULL DEFAULT 0,
    "line_coverage" DOUBLE PRECISION,
    "branch_coverage" DOUBLE PRECISION,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pc_test_coverages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pc_error_global_logs_severity_idx" ON "pc_error_global_logs"("severity");

-- CreateIndex
CREATE INDEX "pc_error_global_logs_brand_id_idx" ON "pc_error_global_logs"("brand_id");

-- CreateIndex
CREATE INDEX "pc_error_global_logs_vertical_type_idx" ON "pc_error_global_logs"("vertical_type");

-- CreateIndex
CREATE INDEX "pc_error_global_logs_created_at_idx" ON "pc_error_global_logs"("created_at");

-- CreateIndex
CREATE INDEX "pc_error_global_logs_error_code_idx" ON "pc_error_global_logs"("error_code");

-- CreateIndex
CREATE INDEX "pc_error_customer_reports_brand_id_idx" ON "pc_error_customer_reports"("brand_id");

-- CreateIndex
CREATE INDEX "pc_error_customer_reports_status_idx" ON "pc_error_customer_reports"("status");

-- CreateIndex
CREATE UNIQUE INDEX "pc_error_escalations_error_log_id_key" ON "pc_error_escalations"("error_log_id");

-- CreateIndex
CREATE INDEX "pc_error_auto_reports_severity_idx" ON "pc_error_auto_reports"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "pc_error_trends_period_period_date_brand_id_key" ON "pc_error_trends"("period", "period_date", "brand_id");

-- CreateIndex
CREATE UNIQUE INDEX "pc_version_releases_version_vertical_type_key" ON "pc_version_releases"("version", "vertical_type");

-- CreateIndex
CREATE UNIQUE INDEX "pc_vertical_versions_vertical_type_key" ON "pc_vertical_versions"("vertical_type");

-- CreateIndex
CREATE UNIQUE INDEX "pc_vertical_registry_code_key" ON "pc_vertical_registry"("code");

-- CreateIndex
CREATE INDEX "pc_vertical_audits_vertical_type_idx" ON "pc_vertical_audits"("vertical_type");

-- CreateIndex
CREATE UNIQUE INDEX "pc_vertical_health_vertical_type_key" ON "pc_vertical_health"("vertical_type");

-- CreateIndex
CREATE UNIQUE INDEX "pc_brand_module_whitelists_brand_id_module_code_key" ON "pc_brand_module_whitelists"("brand_id", "module_code");

-- CreateIndex
CREATE UNIQUE INDEX "pc_brand_feature_flags_brand_id_feature_code_key" ON "pc_brand_feature_flags"("brand_id", "feature_code");

-- CreateIndex
CREATE UNIQUE INDEX "pc_brand_error_summaries_brand_id_period_key" ON "pc_brand_error_summaries"("brand_id", "period");

-- CreateIndex
CREATE INDEX "pc_health_snapshots_service_idx" ON "pc_health_snapshots"("service");

-- CreateIndex
CREATE INDEX "pc_health_snapshots_checked_at_idx" ON "pc_health_snapshots"("checked_at");

-- CreateIndex
CREATE INDEX "pc_alert_history_severity_idx" ON "pc_alert_history"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "pc_dr_plans_service_key" ON "pc_dr_plans"("service");

-- CreateIndex
CREATE INDEX "pc_deployment_logs_environment_idx" ON "pc_deployment_logs"("environment");

-- CreateIndex
CREATE INDEX "pc_deployment_logs_started_at_idx" ON "pc_deployment_logs"("started_at");

-- CreateIndex
CREATE INDEX "pc_pipeline_runs_pipeline_name_idx" ON "pc_pipeline_runs"("pipeline_name");

-- CreateIndex
CREATE UNIQUE INDEX "pc_menu_global_configs_menu_key_key" ON "pc_menu_global_configs"("menu_key");

-- CreateIndex
CREATE INDEX "pc_menu_global_configs_parent_key_idx" ON "pc_menu_global_configs"("parent_key");

-- CreateIndex
CREATE UNIQUE INDEX "pc_menu_brand_overrides_brand_id_menu_key_key" ON "pc_menu_brand_overrides"("brand_id", "menu_key");

-- CreateIndex
CREATE INDEX "pc_test_executions_status_idx" ON "pc_test_executions"("status");

-- CreateIndex
CREATE INDEX "pc_test_executions_started_at_idx" ON "pc_test_executions"("started_at");

-- CreateIndex
CREATE UNIQUE INDEX "pc_test_coverages_module_name_vertical_type_key" ON "pc_test_coverages"("module_name", "vertical_type");

-- AddForeignKey
ALTER TABLE "pc_error_escalations" ADD CONSTRAINT "pc_error_escalations_error_log_id_fkey" FOREIGN KEY ("error_log_id") REFERENCES "pc_error_global_logs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pc_test_executions" ADD CONSTRAINT "pc_test_executions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "pc_test_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

