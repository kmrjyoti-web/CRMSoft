-- AlterTable notification_templates
ALTER TABLE "notification_templates" ADD COLUMN     "available_variables" JSONB,
ADD COLUMN     "body_html" TEXT,
ADD COLUMN     "channel" "NotificationChannel",
ADD COLUMN     "code" VARCHAR(100),
ADD COLUMN     "is_system" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "subject" DROP NOT NULL,
ALTER COLUMN "subject" SET DATA TYPE VARCHAR(500);

-- AlterTable notifications
ALTER TABLE "notifications" ADD COLUMN     "action_url" TEXT,
ADD COLUMN     "delivered_at" TIMESTAMP(3),
ADD COLUMN     "event_type" "NotificationEventType",
ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "failed_at" TIMESTAMP(3),
ADD COLUMN     "failure_reason" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "sent_at" TIMESTAMP(3),
ALTER COLUMN "title" SET DATA TYPE VARCHAR(500);

-- AlterTable reminders
ALTER TABLE "reminders" ADD COLUMN     "acknowledged_at" TIMESTAMP(3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "max_snooze" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "missed_at" TIMESTAMP(3),
ADD COLUMN     "notify_via" JSONB NOT NULL DEFAULT '["PUSH","IN_APP"]',
ADD COLUMN     "recurrence_config" JSONB,
ADD COLUMN     "snooze_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "snoozed_until" TIMESTAMP(3),
ADD COLUMN     "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "task_id" TEXT,
ADD COLUMN     "triggered_at" TIMESTAMP(3),
ADD COLUMN     "type" "ReminderType" NOT NULL DEFAULT 'PERSONAL';

-- CreateTable tasks
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "task_number" TEXT NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "type" "TaskType" NOT NULL DEFAULT 'GENERAL',
    "custom_task_type" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "assigned_to_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "assignment_scope" "TaskAssignmentScope" NOT NULL DEFAULT 'SPECIFIC_USER',
    "assigned_department_id" TEXT,
    "assigned_designation_id" TEXT,
    "assigned_role_id" TEXT,
    "due_date" TIMESTAMP(3),
    "due_time" TEXT,
    "start_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "recurrence" "TaskRecurrence" NOT NULL DEFAULT 'NONE',
    "recurrence_config" JSONB,
    "next_recurrence_date" TIMESTAMP(3),
    "parent_task_id" TEXT,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "tags" JSONB,
    "attachments" JSONB,
    "custom_fields" JSONB,
    "completion_notes" TEXT,
    "estimated_minutes" INTEGER,
    "actual_minutes" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable task_history
CREATE TABLE "task_history" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "task_id" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'UPDATED',
    "field" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "changed_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "task_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable task_watchers
CREATE TABLE "task_watchers" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "task_watchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable comments
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "entity_type" "CommentEntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" JSONB,
    "visibility" "CommentVisibility" NOT NULL DEFAULT 'PUBLIC',
    "author_id" TEXT NOT NULL,
    "created_by_role" TEXT,
    "task_id" TEXT,
    "parent_id" TEXT,
    "mentioned_user_ids" JSONB,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "edited_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable notification_configs
CREATE TABLE "notification_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "event_type" "NotificationEventType" NOT NULL,
    "event_label" TEXT,
    "channels" JSONB NOT NULL DEFAULT '[]',
    "enable_email" BOOLEAN NOT NULL DEFAULT true,
    "enable_whatsapp" BOOLEAN NOT NULL DEFAULT false,
    "enable_push" BOOLEAN NOT NULL DEFAULT true,
    "enable_in_app_alert" BOOLEAN NOT NULL DEFAULT true,
    "enable_call" BOOLEAN NOT NULL DEFAULT false,
    "enable_sms" BOOLEAN NOT NULL DEFAULT false,
    "notify_assignee" BOOLEAN NOT NULL DEFAULT true,
    "notify_creator" BOOLEAN NOT NULL DEFAULT false,
    "notify_manager" BOOLEAN NOT NULL DEFAULT false,
    "notify_watchers" BOOLEAN NOT NULL DEFAULT true,
    "notify_department" BOOLEAN NOT NULL DEFAULT false,
    "custom_recipient_ids" JSONB,
    "template_id" TEXT,
    "email_template_id" TEXT,
    "whatsapp_template_id" TEXT,
    "push_title" TEXT,
    "push_body" TEXT,
    "sms_template" TEXT,
    "respect_quiet_hours" BOOLEAN NOT NULL DEFAULT true,
    "delay_minutes" INTEGER NOT NULL DEFAULT 0,
    "digest_enabled" BOOLEAN NOT NULL DEFAULT false,
    "digest_interval_mins" INTEGER,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "notification_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable escalation_rules
CREATE TABLE "escalation_rules" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" VARCHAR(200),
    "entity_type" TEXT NOT NULL,
    "trigger_event_type" "NotificationEventType",
    "trigger_after_hours" INTEGER NOT NULL,
    "trigger_condition" JSONB,
    "action" "EscalationAction" NOT NULL,
    "action_config" JSONB,
    "target_role_level" INTEGER,
    "escalation_level" INTEGER NOT NULL DEFAULT 1,
    "next_escalation_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "escalation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable communication_logs
CREATE TABLE "communication_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "channel" "NotificationChannel" NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'OUTBOUND',
    "recipient_id" TEXT,
    "recipient_addr" TEXT,
    "recipient_external" TEXT,
    "subject" VARCHAR(500),
    "body" TEXT,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "notification_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "external_id" TEXT,
    "error_message" TEXT,
    "cost_amount" DECIMAL(10,4),
    "cost_currency" TEXT DEFAULT 'INR',
    "sent_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "communication_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable task_logic_configs
CREATE TABLE "task_logic_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "config_key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updated_by_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "task_logic_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable quiet_hour_configs
CREATE TABLE "quiet_hour_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "user_id" TEXT,
    "name" VARCHAR(200) NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "days_of_week" JSONB NOT NULL,
    "allow_urgent" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "quiet_hour_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable scheduled_events
CREATE TABLE "scheduled_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "event_number" TEXT NOT NULL,
    "type" "ScheduledEventType" NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'SCHEDULED',
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "location" VARCHAR(500),
    "meeting_link" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "all_day" BOOLEAN NOT NULL DEFAULT false,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "color" VARCHAR(7),
    "recurrence_pattern" "RecurrencePattern" NOT NULL DEFAULT 'NONE',
    "recurrence_config" JSONB,
    "parent_event_id" TEXT,
    "reminder_minutes" JSONB,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "organizer_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "external_event_id" TEXT,
    "sync_provider" "CalendarSyncProvider",
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cancelled_at" TIMESTAMP(3),
    "cancel_reason" TEXT,
    CONSTRAINT "scheduled_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable event_participants
CREATE TABLE "event_participants" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "event_id" TEXT NOT NULL,
    "user_id" TEXT,
    "email" TEXT,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ATTENDEE',
    "rsvp_status" "RSVPStatus" NOT NULL DEFAULT 'PENDING',
    "rsvp_at" TIMESTAMP(3),
    "is_external" BOOLEAN NOT NULL DEFAULT false,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "notified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable event_history
CREATE TABLE "event_history" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "event_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "field" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "changed_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable user_calendar_syncs
CREATE TABLE "user_calendar_syncs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "CalendarSyncProvider" NOT NULL,
    "direction" "CalendarSyncDirection" NOT NULL DEFAULT 'TWO_WAY',
    "status" "CalendarSyncStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "access_token" TEXT,
    "refresh_token" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "calendar_id" TEXT,
    "external_email" TEXT,
    "webhook_id" TEXT,
    "webhook_expiry" TIMESTAMP(3),
    "last_sync_at" TIMESTAMP(3),
    "sync_token" TEXT,
    "error_message" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_calendar_syncs_pkey" PRIMARY KEY ("id")
);

-- CreateTable user_availability
CREATE TABLE "user_availability" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "is_working_day" BOOLEAN NOT NULL DEFAULT true,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable blocked_slots
CREATE TABLE "blocked_slots" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "reason" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "all_day" BOOLEAN NOT NULL DEFAULT false,
    "status" "AvailabilityStatus" NOT NULL DEFAULT 'OUT_OF_OFFICE',
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrence_pattern" "RecurrencePattern",
    "recurrence_config" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "blocked_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable calendar_configs
CREATE TABLE "calendar_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "config_key" TEXT NOT NULL,
    "config_value" JSONB NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "updated_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "calendar_configs_pkey" PRIMARY KEY ("id")
);

-- Indexes: tasks
CREATE INDEX "tasks_tenant_id_assigned_to_id_status_idx" ON "tasks"("tenant_id", "assigned_to_id", "status");
CREATE INDEX "tasks_tenant_id_created_by_id_idx" ON "tasks"("tenant_id", "created_by_id");
CREATE INDEX "tasks_tenant_id_assigned_department_id_idx" ON "tasks"("tenant_id", "assigned_department_id");
CREATE INDEX "tasks_tenant_id_due_date_idx" ON "tasks"("tenant_id", "due_date");
CREATE INDEX "tasks_tenant_id_entity_type_entity_id_idx" ON "tasks"("tenant_id", "entity_type", "entity_id");
CREATE INDEX "tasks_tenant_id_status_priority_idx" ON "tasks"("tenant_id", "status", "priority");
CREATE UNIQUE INDEX "tasks_tenant_id_task_number_key" ON "tasks"("tenant_id", "task_number");

-- Indexes: task_history
CREATE INDEX "task_history_task_id_idx" ON "task_history"("task_id");
CREATE INDEX "task_history_tenant_id_changed_by_id_idx" ON "task_history"("tenant_id", "changed_by_id");

-- Indexes: task_watchers
CREATE UNIQUE INDEX "task_watchers_task_id_user_id_key" ON "task_watchers"("task_id", "user_id");

-- Indexes: comments
CREATE INDEX "comments_entity_type_entity_id_idx" ON "comments"("entity_type", "entity_id");
CREATE INDEX "comments_tenant_id_entity_type_entity_id_visibility_idx" ON "comments"("tenant_id", "entity_type", "entity_id", "visibility");
CREATE INDEX "comments_task_id_idx" ON "comments"("task_id");
CREATE INDEX "comments_author_id_idx" ON "comments"("author_id");
CREATE INDEX "comments_tenant_id_idx" ON "comments"("tenant_id");

-- Indexes: notification_configs
CREATE INDEX "notification_configs_tenant_id_idx" ON "notification_configs"("tenant_id");
CREATE UNIQUE INDEX "notification_configs_tenant_id_event_type_key" ON "notification_configs"("tenant_id", "event_type");

-- Indexes: escalation_rules
CREATE INDEX "escalation_rules_tenant_id_entity_type_idx" ON "escalation_rules"("tenant_id", "entity_type");
CREATE INDEX "escalation_rules_tenant_id_trigger_event_type_idx" ON "escalation_rules"("tenant_id", "trigger_event_type");

-- Indexes: communication_logs
CREATE INDEX "communication_logs_tenant_id_channel_created_at_idx" ON "communication_logs"("tenant_id", "channel", "created_at");
CREATE INDEX "communication_logs_tenant_id_entity_type_entity_id_idx" ON "communication_logs"("tenant_id", "entity_type", "entity_id");
CREATE INDEX "communication_logs_tenant_id_recipient_id_idx" ON "communication_logs"("tenant_id", "recipient_id");
CREATE INDEX "communication_logs_channel_status_idx" ON "communication_logs"("channel", "status");

-- Indexes: task_logic_configs
CREATE INDEX "task_logic_configs_tenant_id_idx" ON "task_logic_configs"("tenant_id");
CREATE UNIQUE INDEX "task_logic_configs_tenant_id_config_key_key" ON "task_logic_configs"("tenant_id", "config_key");

-- Indexes: quiet_hour_configs
CREATE INDEX "quiet_hour_configs_tenant_id_user_id_idx" ON "quiet_hour_configs"("tenant_id", "user_id");

-- Indexes: scheduled_events
CREATE UNIQUE INDEX "scheduled_events_event_number_key" ON "scheduled_events"("event_number");
CREATE INDEX "scheduled_events_tenant_id_organizer_id_start_time_idx" ON "scheduled_events"("tenant_id", "organizer_id", "start_time");
CREATE INDEX "scheduled_events_tenant_id_start_time_end_time_idx" ON "scheduled_events"("tenant_id", "start_time", "end_time");
CREATE INDEX "scheduled_events_tenant_id_entity_type_entity_id_idx" ON "scheduled_events"("tenant_id", "entity_type", "entity_id");
CREATE INDEX "scheduled_events_external_event_id_sync_provider_idx" ON "scheduled_events"("external_event_id", "sync_provider");
CREATE INDEX "scheduled_events_status_idx" ON "scheduled_events"("status");

-- Indexes: event_participants
CREATE INDEX "event_participants_tenant_id_user_id_idx" ON "event_participants"("tenant_id", "user_id");
CREATE UNIQUE INDEX "event_participants_event_id_user_id_key" ON "event_participants"("event_id", "user_id");

-- Indexes: event_history
CREATE INDEX "event_history_event_id_idx" ON "event_history"("event_id");
CREATE INDEX "event_history_tenant_id_changed_by_id_idx" ON "event_history"("tenant_id", "changed_by_id");

-- Indexes: user_calendar_syncs
CREATE INDEX "user_calendar_syncs_tenant_id_user_id_idx" ON "user_calendar_syncs"("tenant_id", "user_id");
CREATE UNIQUE INDEX "user_calendar_syncs_tenant_id_user_id_provider_key" ON "user_calendar_syncs"("tenant_id", "user_id", "provider");

-- Indexes: user_availability
CREATE INDEX "user_availability_tenant_id_user_id_idx" ON "user_availability"("tenant_id", "user_id");
CREATE UNIQUE INDEX "user_availability_tenant_id_user_id_day_of_week_key" ON "user_availability"("tenant_id", "user_id", "day_of_week");

-- Indexes: blocked_slots
CREATE INDEX "blocked_slots_tenant_id_user_id_start_time_end_time_idx" ON "blocked_slots"("tenant_id", "user_id", "start_time", "end_time");

-- Indexes: calendar_configs
CREATE INDEX "calendar_configs_tenant_id_idx" ON "calendar_configs"("tenant_id");
CREATE UNIQUE INDEX "calendar_configs_tenant_id_config_key_key" ON "calendar_configs"("tenant_id", "config_key");

-- Indexes: notification_templates (new unique)
CREATE UNIQUE INDEX "notification_templates_tenant_id_code_channel_key" ON "notification_templates"("tenant_id", "code", "channel");

-- Indexes: notifications (new)
CREATE INDEX "notifications_tenant_id_event_type_idx" ON "notifications"("tenant_id", "event_type");
CREATE INDEX "notifications_tenant_id_entity_type_entity_id_idx" ON "notifications"("tenant_id", "entity_type", "entity_id");

-- Indexes: reminders (new)
CREATE INDEX "reminders_tenant_id_recipient_id_status_idx" ON "reminders"("tenant_id", "recipient_id", "status");
CREATE INDEX "reminders_tenant_id_scheduled_at_status_idx" ON "reminders"("tenant_id", "scheduled_at", "status");
CREATE INDEX "reminders_task_id_idx" ON "reminders"("task_id");

-- Foreign Keys
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_task_id_fkey" FOREIGN KEY ("parent_task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "task_history" ADD CONSTRAINT "task_history_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "task_history" ADD CONSTRAINT "task_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "task_watchers" ADD CONSTRAINT "task_watchers_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "task_watchers" ADD CONSTRAINT "task_watchers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notification_configs" ADD CONSTRAINT "notification_configs_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "notification_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "quiet_hour_configs" ADD CONSTRAINT "quiet_hour_configs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "scheduled_events" ADD CONSTRAINT "scheduled_events_parent_event_id_fkey" FOREIGN KEY ("parent_event_id") REFERENCES "scheduled_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "scheduled_events" ADD CONSTRAINT "scheduled_events_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "scheduled_events" ADD CONSTRAINT "scheduled_events_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "scheduled_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "event_history" ADD CONSTRAINT "event_history_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "scheduled_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_history" ADD CONSTRAINT "event_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "user_calendar_syncs" ADD CONSTRAINT "user_calendar_syncs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "user_availability" ADD CONSTRAINT "user_availability_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "blocked_slots" ADD CONSTRAINT "blocked_slots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
