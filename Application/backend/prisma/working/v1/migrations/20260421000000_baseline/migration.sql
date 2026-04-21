-- CreateEnum
CREATE TYPE "RawContactStatus" AS ENUM ('RAW', 'VERIFIED', 'REJECTED', 'DUPLICATE');

-- CreateEnum
CREATE TYPE "RawContactSource" AS ENUM ('MANUAL', 'BULK_IMPORT', 'WEB_FORM', 'REFERRAL', 'API');

-- CreateEnum
CREATE TYPE "CommunicationType" AS ENUM ('PHONE', 'EMAIL', 'MOBILE', 'ADDRESS', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "PriorityType" AS ENUM ('PRIMARY', 'WORK', 'HOME', 'PERSONAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ContactOrgRelationType" AS ENUM ('PRIMARY_CONTACT', 'EMPLOYEE', 'CONSULTANT', 'PARTNER', 'VENDOR', 'DIRECTOR', 'FOUNDER');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('RAW', 'VALIDATED');

-- CreateEnum
CREATE TYPE "DataStatus" AS ENUM ('COMPLETE', 'INCOMPLETE_DATA');

-- CreateEnum
CREATE TYPE "ContactSource" AS ENUM ('MANUAL', 'BULK_IMPORT', 'WEB_FORM', 'REFERRAL', 'API');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'VERIFIED', 'ALLOCATED', 'IN_PROGRESS', 'DEMO_SCHEDULED', 'QUOTATION_SENT', 'NEGOTIATION', 'WON', 'LOST', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "LeadPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CALL', 'EMAIL', 'MEETING', 'NOTE', 'WHATSAPP', 'SMS', 'VISIT');

-- CreateEnum
CREATE TYPE "DemoMode" AS ENUM ('ONLINE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "DemoStatus" AS ENUM ('SCHEDULED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "TourPlanStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('DRAFT', 'INTERNAL_REVIEW', 'SENT', 'VIEWED', 'NEGOTIATION', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'REVISED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NegotiationType" AS ENUM ('PRICE_CHANGE', 'ITEM_CHANGE', 'TERM_CHANGE', 'DISCOUNT_REQUEST', 'COUNTER_OFFER', 'REQUIREMENT', 'GENERAL_NOTE');

-- CreateEnum
CREATE TYPE "QuotationPriceType" AS ENUM ('FIXED', 'RANGE', 'NEGOTIABLE');

-- CreateEnum
CREATE TYPE "QuotationSendChannel" AS ENUM ('EMAIL', 'WHATSAPP', 'PORTAL', 'MANUAL', 'DOWNLOAD');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('RAW_CONTACT', 'CONTACT', 'ORGANIZATION', 'LEAD', 'QUOTATION', 'TICKET', 'PRODUCT');

-- CreateEnum
CREATE TYPE "OwnerType" AS ENUM ('PRIMARY_OWNER', 'CO_OWNER', 'WATCHER', 'DELEGATED_OWNER', 'TEAM_OWNER');

-- CreateEnum
CREATE TYPE "OwnershipAction" AS ENUM ('ASSIGN', 'TRANSFER', 'REVOKE', 'DELEGATE', 'AUTO_REVERT', 'ROTATION', 'ESCALATION');

-- CreateEnum
CREATE TYPE "AssignmentMethod" AS ENUM ('MANUAL', 'ROUND_ROBIN', 'RULE_BASED', 'WORKLOAD_BALANCE', 'ESCALATION', 'AUTO_REVERT');

-- CreateEnum
CREATE TYPE "AssignmentRuleStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');

-- CreateEnum
CREATE TYPE "RuleConditionOperator" AS ENUM ('EQUALS', 'NOT_EQUALS', 'CONTAINS', 'GREATER_THAN', 'LESS_THAN', 'IN', 'NOT_IN', 'IS_EMPTY', 'IS_NOT_EMPTY');

-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('GENERAL', 'BRAND', 'MANUFACTURER', 'DISTRIBUTOR', 'DEALER', 'FRANCHISE');

-- CreateEnum
CREATE TYPE "LocationLevel" AS ENUM ('COUNTRY', 'STATE', 'CITY', 'AREA');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DISCONTINUED', 'COMING_SOON');

-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('MRP', 'SALE_PRICE', 'PURCHASE_PRICE', 'DEALER_PRICE', 'DISTRIBUTOR_PRICE', 'SPECIAL_PRICE');

-- CreateEnum
CREATE TYPE "TaxType" AS ENUM ('GST', 'IGST', 'EXEMPT', 'ZERO_RATED', 'COMPOSITE');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('PIECE', 'BOX', 'PACK', 'CARTON', 'KG', 'GRAM', 'LITRE', 'ML', 'METER', 'CM', 'SQ_FT', 'SQ_METER', 'DOZEN', 'SET', 'PAIR', 'ROLL', 'BUNDLE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'CAPTURED', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "WorkflowStateType" AS ENUM ('INITIAL', 'INTERMEDIATE', 'TERMINAL');

-- CreateEnum
CREATE TYPE "WorkflowStateCategory" AS ENUM ('SUCCESS', 'FAILURE', 'PAUSED');

-- CreateEnum
CREATE TYPE "WorkflowTriggerType" AS ENUM ('MANUAL', 'AUTO', 'SCHEDULED', 'APPROVAL');

-- CreateEnum
CREATE TYPE "WorkflowApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DemoResult" AS ENUM ('INTERESTED', 'NOT_INTERESTED', 'FOLLOW_UP', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "FollowUpPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ReminderChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "RecurrencePattern" AS ENUM ('NONE', 'DAILY', 'WEEKDAYS', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'MONTHLY_NTH', 'QUARTERLY', 'YEARLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ScheduledEventType" AS ENUM ('MEETING', 'CALL', 'FOLLOW_UP', 'VISIT', 'TRAINING', 'WEBINAR', 'BREAK', 'PERSONAL', 'HOLIDAY', 'OTHER');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "RSVPStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'TENTATIVE');

-- CreateEnum
CREATE TYPE "CalendarSourceType" AS ENUM ('TASK', 'ACTIVITY', 'DEMO', 'TOUR_PLAN', 'REMINDER', 'FOLLOW_UP', 'SCHEDULED_EVENT', 'EXTERNAL_GOOGLE', 'EXTERNAL_OUTLOOK');

-- CreateEnum
CREATE TYPE "CalendarSyncProvider" AS ENUM ('GOOGLE', 'OUTLOOK', 'ICAL');

-- CreateEnum
CREATE TYPE "CalendarSyncDirection" AS ENUM ('ONE_WAY_TO_CRM', 'ONE_WAY_FROM_CRM', 'TWO_WAY');

-- CreateEnum
CREATE TYPE "CalendarSyncStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ERROR', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('FREE', 'BUSY', 'TENTATIVE', 'OUT_OF_OFFICE');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('LEAD_ASSIGNED', 'LEAD_UPDATED', 'OWNERSHIP_CHANGED', 'DEMO_SCHEDULED', 'DEMO_COMPLETED', 'FOLLOW_UP_DUE', 'FOLLOW_UP_OVERDUE', 'QUOTATION_SENT', 'QUOTATION_APPROVED', 'TOUR_PLAN_APPROVED', 'ACTIVITY_REMINDER', 'DELEGATION_STARTED', 'DELEGATION_ENDED', 'SYSTEM_ALERT', 'WORKFLOW_ACTION');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ', 'DISMISSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH', 'WHATSAPP', 'CALL');

-- CreateEnum
CREATE TYPE "DigestFrequency" AS ENUM ('REALTIME', 'HOURLY', 'DAILY', 'WEEKLY', 'NONE');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD', 'OVERDUE', 'PENDING_APPROVAL');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('GENERAL', 'FOLLOW_UP', 'REMINDER', 'ACTIVITY_LINKED', 'APPROVAL', 'REVIEW', 'CALL_BACK', 'MEETING', 'DEMO', 'CUSTOM');

-- CreateEnum
CREATE TYPE "TaskRecurrence" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "TaskAssignmentScope" AS ENUM ('SELF', 'REPORTEES', 'ANY_USER', 'SPECIFIC_USER', 'DEPARTMENT', 'DESIGNATION', 'ROLE');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'SENT', 'TRIGGERED', 'ACKNOWLEDGED', 'SNOOZED', 'MISSED', 'DISMISSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('PERSONAL', 'TASK_LINKED', 'ACTIVITY_LINKED', 'FOLLOW_UP_LINKED', 'SYSTEM', 'ONCE', 'RECURRING');

-- CreateEnum
CREATE TYPE "CommentVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "CommentEntityType" AS ENUM ('LEAD', 'CONTACT', 'ORGANIZATION', 'TASK', 'ACTIVITY', 'QUOTATION', 'TICKET', 'INVOICE', 'DEMO');

-- CreateEnum
CREATE TYPE "NotificationEventType" AS ENUM ('TASK_ASSIGNED', 'TASK_UPDATED', 'TASK_COMPLETED', 'TASK_OVERDUE', 'TASK_COMMENT', 'TASK_COMMENT_ADDED', 'REMINDER_DUE', 'REMINDER_TRIGGERED', 'REMINDER_MISSED', 'LEAD_ASSIGNED', 'LEAD_STATUS_CHANGED', 'LEAD_COMMENT_ADDED', 'LEAD_FOLLOW_UP_DUE', 'LEAD_WON', 'LEAD_LOST', 'ACTIVITY_TAGGED', 'ACTIVITY_REMINDER', 'COMMENT_ADDED', 'COMMENT_PRIVATE', 'APPROVAL_REQUIRED', 'ESCALATION_TRIGGERED', 'SYSTEM_ALERT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EscalationAction" AS ENUM ('NOTIFY_MANAGER', 'NOTIFY_ADMIN', 'REASSIGN', 'REASSIGN_TASK', 'ESCALATE_UP', 'CHANGE_PRIORITY', 'AUTO_CLOSE', 'CUSTOM_WEBHOOK');

-- CreateEnum
CREATE TYPE "TargetPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "TargetMetric" AS ENUM ('LEADS_CREATED', 'LEADS_WON', 'REVENUE', 'ACTIVITIES', 'DEMOS', 'CALLS', 'MEETINGS', 'VISITS', 'QUOTATIONS_SENT', 'QUOTATIONS_ACCEPTED');

-- CreateEnum
CREATE TYPE "ReportFormat" AS ENUM ('CSV', 'XLSX', 'JSON', 'PDF');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('LEAD_REPORT', 'ACTIVITY_REPORT', 'QUOTATION_REPORT', 'DEMO_REPORT', 'TOUR_PLAN_REPORT', 'REVENUE_REPORT', 'PIPELINE_REPORT', 'TEAM_PERFORMANCE_REPORT', 'CONVERSION_REPORT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ReportFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'ON_DEMAND');

-- CreateEnum
CREATE TYPE "ScheduledReportStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('SALES', 'LEAD', 'CONTACT_ORG', 'ACTIVITY', 'DEMO', 'QUOTATION', 'TOUR_PLAN', 'TEAM', 'COMMUNICATION', 'EXECUTIVE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ImportJobStatus" AS ENUM ('UPLOADING', 'PARSING', 'PARSED', 'MAPPING', 'MAPPED', 'VALIDATING', 'VALIDATED', 'REVIEWING', 'IMPORTING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ImportTargetEntity" AS ENUM ('ROW_CONTACT', 'CONTACT', 'ORGANIZATION', 'LEAD', 'PRODUCT', 'LEDGER');

-- CreateEnum
CREATE TYPE "ImportRowStatus" AS ENUM ('PENDING', 'VALID', 'INVALID', 'DUPLICATE_EXACT', 'DUPLICATE_FUZZY', 'DUPLICATE_UPDATE', 'DUPLICATE_NEW', 'DUPLICATE_IN_FILE', 'SKIPPED', 'IMPORTING', 'IMPORTED', 'FAILED');

-- CreateEnum
CREATE TYPE "DuplicateStrategy" AS ENUM ('SKIP', 'UPDATE', 'CREATE_ANYWAY', 'ASK_PER_ROW');

-- CreateEnum
CREATE TYPE "DuplicateConfidence" AS ENUM ('EXACT', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ExportStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ValidatorType" AS ENUM ('REQUIRED', 'EMAIL', 'INDIAN_MOBILE', 'PHONE', 'GST_NUMBER', 'PAN_NUMBER', 'TAN_NUMBER', 'AADHAAR', 'IFSC_CODE', 'PINCODE', 'WEBSITE', 'URL', 'NUMERIC', 'DECIMAL', 'DATE', 'ENUM', 'CUSTOM_REGEX', 'MIN_LENGTH', 'MAX_LENGTH');

-- CreateEnum
CREATE TYPE "StorageType" AS ENUM ('LOCAL', 'S3', 'CLOUD_LINK');

-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('NONE', 'GOOGLE_DRIVE', 'ONEDRIVE', 'DROPBOX');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('UPLOADING', 'ACTIVE', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('GENERAL', 'PROPOSAL', 'CONTRACT', 'INVOICE', 'QUOTATION', 'REPORT', 'PRESENTATION', 'SPREADSHEET', 'IMAGE', 'VIDEO', 'AUDIO', 'OTHER');

-- CreateEnum
CREATE TYPE "CloudConnectionStatus" AS ENUM ('CONNECTED', 'EXPIRED', 'REVOKED', 'ERROR');

-- CreateEnum
CREATE TYPE "ShareLinkAccess" AS ENUM ('VIEW', 'DOWNLOAD', 'EDIT');

-- CreateEnum
CREATE TYPE "EmailProvider" AS ENUM ('GMAIL', 'OUTLOOK', 'IMAP_SMTP', 'ORGANIZATION_SMTP');

-- CreateEnum
CREATE TYPE "EmailAccountStatus" AS ENUM ('ACTIVE', 'DISCONNECTED', 'ERROR', 'TOKEN_EXPIRED', 'SYNCING');

-- CreateEnum
CREATE TYPE "EmailDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('DRAFT', 'QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'REPLIED', 'BOUNCED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EmailPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'PAUSED', 'COMPLETED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "CampaignRecipientStatus" AS ENUM ('PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'REPLIED', 'BOUNCED', 'FAILED', 'UNSUBSCRIBED');

-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('GENERAL', 'FOLLOW_UP', 'INTRODUCTION', 'PROPOSAL', 'QUOTATION_MAIL', 'MEETING', 'THANK_YOU', 'REMINDER', 'FEEDBACK', 'CAMPAIGN', 'WELCOME', 'ANNOUNCEMENT', 'NEWSLETTER', 'CUSTOM');

-- CreateEnum
CREATE TYPE "WabaConnectionStatus" AS ENUM ('ACTIVE', 'DISCONNECTED', 'ERROR', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "WaConversationStatus" AS ENUM ('OPEN', 'PENDING', 'RESOLVED', 'EXPIRED', 'SPAM');

-- CreateEnum
CREATE TYPE "WaMessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "WaMessageType" AS ENUM ('TEXT', 'TEMPLATE', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'STICKER', 'LOCATION', 'CONTACT_CARD', 'INTERACTIVE', 'REACTION', 'BUTTON_REPLY', 'LIST_REPLY', 'ORDER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "WaMessageStatus" AS ENUM ('PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "WaTemplateStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAUSED', 'DISABLED', 'DELETED');

-- CreateEnum
CREATE TYPE "WaTemplateCategory" AS ENUM ('UTILITY', 'AUTHENTICATION', 'MARKETING');

-- CreateEnum
CREATE TYPE "WaBroadcastStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'PAUSED', 'COMPLETED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "WaBroadcastRecipientStatus" AS ENUM ('PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'OPTED_OUT');

-- CreateEnum
CREATE TYPE "WaChatbotFlowStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');

-- CreateEnum
CREATE TYPE "WaChatbotNodeType" AS ENUM ('WELCOME', 'KEYWORD_TRIGGER', 'MENU', 'TEXT_REPLY', 'MEDIA_REPLY', 'QUICK_BUTTONS', 'COLLECT_INPUT', 'CONDITION', 'API_CALL', 'ASSIGN_AGENT', 'DELAY', 'TAG_CONTACT', 'LINK_LEAD');

-- CreateEnum
CREATE TYPE "SyncDirection" AS ENUM ('BIDIRECTIONAL', 'DOWNLOAD_ONLY', 'UPLOAD_ONLY', 'DISABLED');

-- CreateEnum
CREATE TYPE "ConflictStrategy" AS ENUM ('SERVER_WINS', 'CLIENT_WINS', 'LATEST_WINS', 'MERGE_FIELDS', 'MANUAL');

-- CreateEnum
CREATE TYPE "SyncWarningLevel" AS ENUM ('INFO', 'WARNING', 'URGENT', 'BLOCK');

-- CreateEnum
CREATE TYPE "SyncEnforcement" AS ENUM ('WARN_ONLY', 'BLOCK_AFTER_DELAY', 'BLOCK_UNTIL_SYNC', 'FLUSH_AND_RESYNC');

-- CreateEnum
CREATE TYPE "SyncWarningTrigger" AS ENUM ('TIME_SINCE_SYNC', 'DATA_AGE', 'PENDING_UPLOAD_COUNT', 'PENDING_UPLOAD_AGE', 'STORAGE_SIZE', 'ENTITY_SPECIFIC');

-- CreateEnum
CREATE TYPE "FlushType" AS ENUM ('FULL', 'ENTITY', 'DEVICE');

-- CreateEnum
CREATE TYPE "FlushStatus" AS ENUM ('PENDING', 'ACKNOWLEDGED', 'EXECUTED', 'FAILED');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED', 'FLUSH_PENDING');

-- CreateEnum
CREATE TYPE "ChangeAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'SOFT_DELETE');

-- CreateEnum
CREATE TYPE "ConflictStatus" AS ENUM ('PENDING', 'AUTO_RESOLVED', 'MANUALLY_RESOLVED', 'SERVER_APPLIED', 'CLIENT_APPLIED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "CronJobStatus" AS ENUM ('ACTIVE', 'PAUSED', 'DISABLED');

-- CreateEnum
CREATE TYPE "CronJobScope" AS ENUM ('GLOBAL', 'TENANT');

-- CreateEnum
CREATE TYPE "CronRunStatus" AS ENUM ('SUCCESS', 'FAILED', 'TIMEOUT', 'SKIPPED', 'RUNNING');

-- CreateEnum
CREATE TYPE "CronAlertChannel" AS ENUM ('EMAIL', 'IN_APP', 'BOTH');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('BUG', 'FEATURE_REQUEST', 'BILLING', 'PERFORMANCE', 'DATA_ISSUE', 'SECURITY', 'OTHER');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'WAITING_ON_VENDOR', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "HolidayType" AS ENUM ('NATIONAL', 'REGIONAL', 'COMPANY', 'OPTIONAL');

-- CreateEnum
CREATE TYPE "SequenceResetPolicy" AS ENUM ('NEVER', 'DAILY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "NotificationEventCategory" AS ENUM ('LEAD', 'CONTACT', 'ACTIVITY', 'DEMO', 'QUOTATION', 'TOUR_PLAN', 'SYSTEM', 'USER');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'VOID');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CHEQUE', 'BANK_TRANSFER', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING', 'WALLET', 'RAZORPAY', 'STRIPE', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('RAZORPAY', 'STRIPE', 'MANUAL');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('REFUND_PENDING', 'REFUND_PROCESSED', 'REFUND_FAILED', 'REFUND_CANCELLED');

-- CreateEnum
CREATE TYPE "CreditNoteStatus" AS ENUM ('CN_DRAFT', 'CN_ISSUED', 'CN_APPLIED', 'CN_CANCELLED');

-- CreateEnum
CREATE TYPE "ReminderLevel" AS ENUM ('GENTLE', 'FIRM', 'URGENT', 'FINAL');

-- CreateEnum
CREATE TYPE "ProformaInvoiceStatus" AS ENUM ('PI_DRAFT', 'PI_SENT', 'PI_ACCEPTED', 'PI_REJECTED', 'PI_CONVERTED', 'PI_CANCELLED');

-- CreateEnum
CREATE TYPE "ApiKeyStatus" AS ENUM ('API_ACTIVE', 'API_REVOKED', 'API_EXPIRED', 'API_SUSPENDED');

-- CreateEnum
CREATE TYPE "WebhookStatus" AS ENUM ('WH_ACTIVE', 'WH_PAUSED', 'WH_FAILED', 'WH_DISABLED');

-- CreateEnum
CREATE TYPE "WebhookDeliveryStatus" AS ENUM ('WH_PENDING', 'WH_DELIVERED', 'WH_DELIVERY_FAILED', 'WH_RETRYING');

-- CreateEnum
CREATE TYPE "ApiLogLevel" AS ENUM ('API_INFO', 'API_WARN', 'API_ERROR');

-- CreateEnum
CREATE TYPE "FeatureType" AS ENUM ('PAGE', 'WIDGET', 'REPORT', 'ACTION', 'INTEGRATION');

-- CreateEnum
CREATE TYPE "EntityLimitType" AS ENUM ('CONTACTS', 'ORGANIZATIONS', 'LEADS', 'QUOTATIONS', 'INVOICES', 'PRODUCTS', 'USERS', 'FILE_STORAGE_MB', 'DB_SIZE_MB', 'MARKETPLACE_PROMOTIONS', 'EMAIL_PER_MONTH', 'WHATSAPP_PER_MONTH', 'SMS_PER_MONTH', 'API_CALLS_PER_DAY', 'REPORTS_COUNT', 'WORKFLOWS_COUNT', 'CUSTOM_FIELDS_COUNT');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('GST_INVOICE', 'PROFORMA_INVOICE', 'QUOTATION', 'RECEIPT', 'PURCHASE_ORDER', 'SALE_CHALLAN', 'DELIVERY_CHALLAN', 'CREDIT_NOTE', 'DEBIT_NOTE', 'CUSTOMER_STATEMENT', 'SALES_REPORT', 'STOCK_REPORT', 'LEDGER_REPORT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "InventoryType" AS ENUM ('SERIAL', 'BATCH', 'EXPIRY', 'BOM', 'SIMPLE');

-- CreateEnum
CREATE TYPE "SerialStatus" AS ENUM ('AVAILABLE', 'SOLD', 'RESERVED', 'EXPIRED', 'DAMAGED', 'RETURNED', 'ACTIVATED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "ExpiryType" AS ENUM ('FIXED_DATE', 'DAYS', 'MONTHS', 'YEARS', 'NEVER');

-- CreateEnum
CREATE TYPE "InventoryTaxType" AS ENUM ('INV_GST', 'INV_CESS', 'INV_TDS', 'INV_EXEMPT', 'INV_ZERO_RATED');

-- CreateEnum
CREATE TYPE "StockTransactionType" AS ENUM ('PURCHASE_IN', 'SALE_OUT', 'RETURN_IN', 'TRANSFER', 'ADJUSTMENT', 'OPENING_BALANCE', 'DAMAGE', 'WRITE_OFF', 'PRODUCTION_IN', 'PRODUCTION_OUT', 'SCRAP');

-- CreateEnum
CREATE TYPE "AdjustmentStatus" AS ENUM ('ADJ_PENDING', 'ADJ_APPROVED', 'ADJ_REJECTED');

-- CreateEnum
CREATE TYPE "ScrapType" AS ENUM ('SCRAP_EXPIRED', 'SCRAP_DAMAGED', 'SCRAP_PRODUCTION_WASTE', 'SCRAP_RETURNED_DEFECTIVE', 'SCRAP_QUALITY_FAILURE');

-- CreateEnum
CREATE TYPE "UnitCategory" AS ENUM ('WEIGHT', 'VOLUME', 'LENGTH', 'QUANTITY', 'AREA');

-- CreateEnum
CREATE TYPE "EntityVerificationMode" AS ENUM ('OTP', 'LINK');

-- CreateEnum
CREATE TYPE "EntityVerificationChannel" AS ENUM ('EMAIL', 'MOBILE_SMS', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "EntityVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'EXPIRED', 'FAILED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VerifiedByType" AS ENUM ('SELF', 'STAFF', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AiModelSource" AS ENUM ('OLLAMA', 'CLOUD');

-- CreateEnum
CREATE TYPE "AiModelStatus" AS ENUM ('AVAILABLE', 'DOWNLOADING', 'NOT_INSTALLED', 'ERROR');

-- CreateEnum
CREATE TYPE "AiDatasetStatus" AS ENUM ('DRAFT', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "AiTrainingJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AiChatSessionStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DELETED');

-- CreateTable
CREATE TABLE "gv_acc_invoices" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "invoice_no" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "quotation_id" TEXT,
    "lead_id" TEXT,
    "sale_order_id" TEXT,
    "delivery_challan_id" TEXT,
    "inventory_effect" BOOLEAN NOT NULL DEFAULT true,
    "accounts_effect" BOOLEAN NOT NULL DEFAULT true,
    "contact_id" TEXT,
    "organization_id" TEXT,
    "billing_name" TEXT NOT NULL,
    "billing_address" TEXT,
    "billing_city" TEXT,
    "billing_state" TEXT,
    "billing_pincode" TEXT,
    "billing_gst_number" TEXT,
    "shipping_name" TEXT,
    "shipping_address" TEXT,
    "shipping_city" TEXT,
    "shipping_state" TEXT,
    "shipping_pincode" TEXT,
    "seller_name" TEXT NOT NULL,
    "seller_address" TEXT,
    "seller_city" TEXT,
    "seller_state" TEXT,
    "seller_pincode" TEXT,
    "seller_gst_number" TEXT,
    "seller_pan_number" TEXT,
    "invoice_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(3) NOT NULL,
    "supply_date" TIMESTAMP(3),
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discount_type" TEXT,
    "discount_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxable_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cgst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sgst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "igst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cess_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_tax" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "round_off" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "amount_in_words" TEXT,
    "paid_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "balance_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "is_inter_state" BOOLEAN NOT NULL DEFAULT false,
    "bank_name" TEXT,
    "bank_branch" TEXT,
    "account_number" TEXT,
    "ifsc_code" TEXT,
    "upi_id" TEXT,
    "notes" TEXT,
    "terms_and_conditions" TEXT,
    "internal_notes" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancelled_by_id" TEXT,
    "cancel_reason" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,
    "vertical_data" JSONB DEFAULT '{}',

    CONSTRAINT "gv_acc_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_acc_invoice_line_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "invoice_id" TEXT NOT NULL,
    "product_id" TEXT,
    "product_code" TEXT,
    "product_name" TEXT NOT NULL,
    "description" TEXT,
    "hsn_code" TEXT,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" TEXT,
    "unit_price" DECIMAL(14,2) NOT NULL,
    "mrp" DECIMAL(14,2),
    "discount_type" TEXT,
    "discount_value" DECIMAL(14,2),
    "discount_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "line_total" DECIMAL(14,2) NOT NULL,
    "gst_rate" DECIMAL(5,2),
    "cgst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sgst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "igst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cess_rate" DECIMAL(5,2),
    "cess_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_with_tax" DECIMAL(14,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_acc_invoice_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_acc_proforma_invoices" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "proforma_no" TEXT NOT NULL,
    "status" "ProformaInvoiceStatus" NOT NULL DEFAULT 'PI_DRAFT',
    "quotation_id" TEXT,
    "lead_id" TEXT,
    "contact_id" TEXT,
    "organization_id" TEXT,
    "billing_name" TEXT NOT NULL,
    "billing_address" TEXT,
    "billing_city" TEXT,
    "billing_state" TEXT,
    "billing_pincode" TEXT,
    "billing_gst_number" TEXT,
    "seller_name" TEXT NOT NULL,
    "seller_address" TEXT,
    "seller_city" TEXT,
    "seller_state" TEXT,
    "seller_pincode" TEXT,
    "seller_gst_number" TEXT,
    "seller_pan_number" TEXT,
    "proforma_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMP(3),
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discount_type" TEXT,
    "discount_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxable_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cgst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sgst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "igst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cess_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_tax" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "round_off" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "amount_in_words" TEXT,
    "is_inter_state" BOOLEAN NOT NULL DEFAULT false,
    "invoice_id" TEXT,
    "notes" TEXT,
    "terms_and_conditions" TEXT,
    "internal_notes" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancelled_by_id" TEXT,
    "cancel_reason" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_acc_proforma_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_acc_proforma_line_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "proforma_invoice_id" TEXT NOT NULL,
    "product_id" TEXT,
    "product_code" TEXT,
    "product_name" TEXT NOT NULL,
    "description" TEXT,
    "hsn_code" TEXT,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" TEXT,
    "unit_price" DECIMAL(14,2) NOT NULL,
    "mrp" DECIMAL(14,2),
    "discount_type" TEXT,
    "discount_value" DECIMAL(14,2),
    "discount_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "line_total" DECIMAL(14,2) NOT NULL,
    "gst_rate" DECIMAL(5,2),
    "cgst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sgst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "igst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cess_rate" DECIMAL(5,2),
    "cess_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_with_tax" DECIMAL(14,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_acc_proforma_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_acc_credit_notes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "credit_note_no" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "CreditNoteStatus" NOT NULL DEFAULT 'CN_DRAFT',
    "applied_to_invoice_id" TEXT,
    "applied_amount" DECIMAL(14,2),
    "applied_at" TIMESTAMP(3),
    "issued_at" TIMESTAMP(3),
    "issued_by_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_acc_credit_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_acc_saved_formulas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "expression" TEXT NOT NULL,
    "description" TEXT,
    "required_fields" JSONB NOT NULL DEFAULT '[]',
    "output_type" TEXT NOT NULL DEFAULT 'number',
    "output_format" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_acc_saved_formulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_acc_purchase_invoices" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "vendor_invoice_no" TEXT NOT NULL,
    "our_reference" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "po_id" TEXT,
    "goods_receipt_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "invoice_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3),
    "received_date" TIMESTAMP(3),
    "inventory_effect" BOOLEAN NOT NULL DEFAULT true,
    "accounts_effect" BOOLEAN NOT NULL DEFAULT true,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "discount_amount" DECIMAL(12,2),
    "taxable_amount" DECIMAL(12,2) NOT NULL,
    "cgst_amount" DECIMAL(12,2),
    "sgst_amount" DECIMAL(12,2),
    "igst_amount" DECIMAL(12,2),
    "cess_amount" DECIMAL(12,2),
    "tds_amount" DECIMAL(12,2),
    "round_off" DECIMAL(10,2),
    "grand_total" DECIMAL(12,2) NOT NULL,
    "payment_status" TEXT NOT NULL DEFAULT 'UNPAID',
    "paid_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "balance_amount" DECIMAL(12,2) NOT NULL,
    "workflow_instance_id" TEXT,
    "ledger_mapping_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "approved_by_id" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_acc_purchase_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_acc_purchase_invoice_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "po_item_id" TEXT,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit_id" TEXT NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2),
    "taxable_amount" DECIMAL(12,2) NOT NULL,
    "cgst_rate" DECIMAL(5,2),
    "cgst_amount" DECIMAL(10,2),
    "sgst_rate" DECIMAL(5,2),
    "sgst_amount" DECIMAL(10,2),
    "igst_rate" DECIMAL(5,2),
    "igst_amount" DECIMAL(10,2),
    "hsn_code" TEXT,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_acc_purchase_invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_acc_ledger_masters" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group_type" TEXT NOT NULL,
    "sub_group" TEXT,
    "parent_id" TEXT,
    "account_group_id" TEXT,
    "opening_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "opening_balance_type" TEXT NOT NULL DEFAULT 'Dr',
    "current_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "alias_name" TEXT,
    "mail_to" TEXT,
    "address" TEXT,
    "country" TEXT DEFAULT 'India',
    "state" TEXT,
    "city" TEXT,
    "pincode" TEXT,
    "station" TEXT,
    "currency" TEXT DEFAULT 'INR',
    "balancing_method" TEXT,
    "credit_days" INTEGER,
    "credit_limit" DECIMAL(12,2),
    "phone_office" TEXT,
    "mobile_1" TEXT,
    "mobile_2" TEXT,
    "whatsapp_no" TEXT,
    "email" TEXT,
    "ledger_type" TEXT,
    "pan_no" TEXT,
    "gstin" TEXT,
    "gst_applicable" BOOLEAN NOT NULL DEFAULT false,
    "gst_type" TEXT,
    "bank_name" TEXT,
    "bank_account_no" TEXT,
    "bank_ifsc" TEXT,
    "bank_branch" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_acc_ledger_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_acc_ledger_mappings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "entity_name" TEXT,
    "ledger_id" TEXT NOT NULL,
    "mapping_type" TEXT NOT NULL,
    "credit_limit" DECIMAL(12,2),
    "credit_days" INTEGER,
    "gstin" TEXT,
    "pan" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_acc_ledger_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_acc_transactions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "voucher_type" TEXT NOT NULL,
    "voucher_number" TEXT NOT NULL,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "debit_ledger_id" TEXT NOT NULL,
    "credit_ledger_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "narration" TEXT,
    "created_by_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_acc_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_acc_bank_accounts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "account_type" TEXT NOT NULL,
    "ifsc_code" TEXT NOT NULL,
    "branch_name" TEXT,
    "ledger_id" TEXT NOT NULL,
    "opening_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "current_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_acc_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_acc_bank_reconciliations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "bank_account_id" TEXT NOT NULL,
    "reconciliation_date" TIMESTAMP(3) NOT NULL,
    "statement_balance" DECIMAL(12,2) NOT NULL,
    "book_balance" DECIMAL(12,2) NOT NULL,
    "difference" DECIMAL(12,2) NOT NULL,
    "unreconciled_items" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "reconciled_by_id" TEXT,
    "completed_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_acc_bank_reconciliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_acc_debit_notes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "debit_note_number" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "purchase_invoice_id" TEXT,
    "goods_receipt_id" TEXT,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "note_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "cgst_amount" DECIMAL(12,2),
    "sgst_amount" DECIMAL(12,2),
    "igst_amount" DECIMAL(12,2),
    "grand_total" DECIMAL(12,2) NOT NULL,
    "inventory_effect" BOOLEAN NOT NULL DEFAULT true,
    "accounts_effect" BOOLEAN NOT NULL DEFAULT true,
    "workflow_instance_id" TEXT,
    "account_transaction_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_acc_debit_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_acc_debit_note_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "debit_note_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit_id" TEXT NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "taxable_amount" DECIMAL(12,2) NOT NULL,
    "cgst_amount" DECIMAL(10,2),
    "sgst_amount" DECIMAL(10,2),
    "igst_amount" DECIMAL(10,2),
    "hsn_code" TEXT,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_acc_debit_note_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_acc_account_groups" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "parent_id" TEXT,
    "primary_group" TEXT NOT NULL,
    "nature" TEXT NOT NULL DEFAULT 'DEBIT',
    "is_prohibited" BOOLEAN NOT NULL DEFAULT false,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_acc_account_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_aud_sync_change_logs" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "entity_name" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" "ChangeAction" NOT NULL,
    "changed_fields" JSONB,
    "full_record" JSONB,
    "previous_values" JSONB,
    "client_timestamp" TIMESTAMP(3) NOT NULL,
    "client_version" INTEGER NOT NULL DEFAULT 1,
    "is_pushed" BOOLEAN NOT NULL DEFAULT false,
    "pushed_at" TIMESTAMP(3),
    "push_result" TEXT,
    "conflict_id" TEXT,
    "error_message" TEXT,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_aud_sync_change_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_aud_sync_audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_name" TEXT,
    "records_pulled" INTEGER,
    "records_pushed" INTEGER,
    "conflicts_detected" INTEGER,
    "conflicts_resolved" INTEGER,
    "duration_ms" INTEGER,
    "details" JSONB,
    "error_message" TEXT,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_aud_sync_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_aud_cron_job_run_logs" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "job_code" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "finished_at" TIMESTAMP(3),
    "duration_ms" INTEGER,
    "status" "CronRunStatus" NOT NULL,
    "records_processed" INTEGER,
    "records_succeeded" INTEGER,
    "records_failed" INTEGER,
    "tenant_id" TEXT,
    "tenant_name" TEXT,
    "error_message" TEXT,
    "error_stack" TEXT,
    "retry_attempt" INTEGER NOT NULL DEFAULT 0,
    "details" JSONB,
    "triggered_by" TEXT NOT NULL DEFAULT 'SCHEDULER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_aud_cron_job_run_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_aud_api_request_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "api_key_id" TEXT NOT NULL,
    "api_key_name" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "query_params" JSONB,
    "request_body" JSONB,
    "request_headers" JSONB,
    "status_code" INTEGER NOT NULL,
    "response_body" JSONB,
    "response_time_ms" INTEGER NOT NULL,
    "ip" TEXT NOT NULL,
    "user_agent" TEXT,
    "request_id" TEXT NOT NULL,
    "rate_limit_remaining" INTEGER,
    "rate_limit_used" INTEGER,
    "was_rate_limited" BOOLEAN NOT NULL DEFAULT false,
    "error_code" TEXT,
    "error_message" TEXT,
    "level" "ApiLogLevel" NOT NULL DEFAULT 'API_INFO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_aud_api_request_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_aud_unmask_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "user_id" TEXT NOT NULL,
    "table_key" TEXT NOT NULL,
    "column_id" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "unmasked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_aud_unmask_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_aud_ai_usage_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "prompt_tokens" INTEGER NOT NULL DEFAULT 0,
    "output_tokens" INTEGER NOT NULL DEFAULT 0,
    "total_tokens" INTEGER NOT NULL DEFAULT 0,
    "latency_ms" INTEGER NOT NULL DEFAULT 0,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT,
    "user_id" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_aud_ai_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_aud_control_room_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "rule_code" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "previous_value" TEXT,
    "new_value" TEXT NOT NULL,
    "page_code" TEXT,
    "role_id" TEXT,
    "user_id" TEXT,
    "changed_by_user_id" TEXT NOT NULL,
    "changed_by_user_name" TEXT NOT NULL,
    "change_reason" TEXT,
    "ip_address" TEXT,
    "batch_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_aud_control_room_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cmn_email_accounts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "user_id" TEXT NOT NULL,
    "provider" "EmailProvider" NOT NULL,
    "label" TEXT,
    "email_address" TEXT NOT NULL,
    "display_name" TEXT,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "oauth_scope" TEXT,
    "imap_host" TEXT,
    "imap_port" INTEGER,
    "imap_secure" BOOLEAN,
    "smtp_host" TEXT,
    "smtp_port" INTEGER,
    "smtp_secure" BOOLEAN,
    "smtp_username" TEXT,
    "smtp_password" TEXT,
    "status" "EmailAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_sync_at" TIMESTAMP(3),
    "last_sync_error" TEXT,
    "sync_token" TEXT,
    "sync_from_date" TIMESTAMP(3),
    "sync_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "auto_link_enabled" BOOLEAN NOT NULL DEFAULT true,
    "signature_id" TEXT,
    "total_sent" INTEGER NOT NULL DEFAULT 0,
    "total_received" INTEGER NOT NULL DEFAULT 0,
    "daily_send_limit" INTEGER NOT NULL DEFAULT 500,
    "today_sent_count" INTEGER NOT NULL DEFAULT 0,
    "daily_reset_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cmn_email_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cmn_email_threads" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "subject" TEXT NOT NULL,
    "participant_emails" JSONB NOT NULL,
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "last_message_at" TIMESTAMP(3),
    "last_message_snippet" TEXT,
    "linked_entity_type" TEXT,
    "linked_entity_id" TEXT,
    "provider_thread_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cmn_email_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cmn_emails" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "account_id" TEXT NOT NULL,
    "direction" "EmailDirection" NOT NULL,
    "from_email" TEXT NOT NULL,
    "from_name" TEXT,
    "to_emails" JSONB NOT NULL,
    "cc_emails" JSONB,
    "bcc_emails" JSONB,
    "reply_to_email" TEXT,
    "subject" TEXT NOT NULL,
    "body_html" TEXT,
    "body_text" TEXT,
    "snippet" TEXT,
    "thread_id" TEXT,
    "in_reply_to_message_id" TEXT,
    "references" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "provider_message_id" TEXT,
    "provider_thread_id" TEXT,
    "internet_message_id" TEXT,
    "status" "EmailStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "EmailPriority" NOT NULL DEFAULT 'NORMAL',
    "scheduled_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "tracking_enabled" BOOLEAN NOT NULL DEFAULT true,
    "tracking_pixel_id" TEXT,
    "open_count" INTEGER NOT NULL DEFAULT 0,
    "first_opened_at" TIMESTAMP(3),
    "last_opened_at" TIMESTAMP(3),
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "first_clicked_at" TIMESTAMP(3),
    "is_replied" BOOLEAN NOT NULL DEFAULT false,
    "replied_at" TIMESTAMP(3),
    "is_bounced" BOOLEAN NOT NULL DEFAULT false,
    "bounce_reason" TEXT,
    "linked_entity_type" TEXT,
    "linked_entity_id" TEXT,
    "auto_linked" BOOLEAN NOT NULL DEFAULT false,
    "activity_id" TEXT,
    "campaign_id" TEXT,
    "campaign_recipient_id" TEXT,
    "template_id" TEXT,
    "has_attachments" BOOLEAN NOT NULL DEFAULT false,
    "attachment_count" INTEGER NOT NULL DEFAULT 0,
    "is_starred" BOOLEAN NOT NULL DEFAULT false,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "labels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cmn_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cmn_email_attachments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "email_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT,
    "file_size" INTEGER,
    "file_path" TEXT,
    "provider_attachment_id" TEXT,
    "is_inline" BOOLEAN NOT NULL DEFAULT false,
    "content_id" TEXT,
    "document_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cmn_email_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cmn_email_templates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "category" "TemplateCategory" NOT NULL DEFAULT 'GENERAL',
    "description" TEXT,
    "subject" TEXT NOT NULL,
    "body_html" TEXT NOT NULL,
    "body_text" TEXT,
    "variables" JSONB,
    "is_shared" BOOLEAN NOT NULL DEFAULT false,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "open_rate" DECIMAL(5,2),
    "click_rate" DECIMAL(5,2),
    "reply_rate" DECIMAL(5,2),
    "created_by_id" TEXT NOT NULL,
    "created_by_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cmn_email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cmn_email_signatures" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "body_html" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cmn_email_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cmn_email_campaigns" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "template_id" TEXT,
    "subject" TEXT NOT NULL,
    "body_html" TEXT NOT NULL,
    "body_text" TEXT,
    "account_id" TEXT NOT NULL,
    "from_name" TEXT,
    "reply_to_email" TEXT,
    "total_recipients" INTEGER NOT NULL DEFAULT 0,
    "recipient_source" TEXT,
    "recipient_filter" JSONB,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduled_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "send_rate_per_minute" INTEGER NOT NULL DEFAULT 30,
    "batch_size" INTEGER NOT NULL DEFAULT 50,
    "delay_between_batches_ms" INTEGER NOT NULL DEFAULT 60000,
    "track_opens" BOOLEAN NOT NULL DEFAULT true,
    "track_clicks" BOOLEAN NOT NULL DEFAULT true,
    "include_unsubscribe" BOOLEAN NOT NULL DEFAULT true,
    "unsubscribe_url" TEXT,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "delivered_count" INTEGER NOT NULL DEFAULT 0,
    "opened_count" INTEGER NOT NULL DEFAULT 0,
    "clicked_count" INTEGER NOT NULL DEFAULT 0,
    "replied_count" INTEGER NOT NULL DEFAULT 0,
    "bounced_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "unsubscribed_count" INTEGER NOT NULL DEFAULT 0,
    "open_rate" DECIMAL(5,2),
    "click_rate" DECIMAL(5,2),
    "created_by_id" TEXT NOT NULL,
    "created_by_name" TEXT NOT NULL,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cmn_email_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cmn_campaign_recipients" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "campaign_id" TEXT NOT NULL,
    "contact_id" TEXT,
    "email" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "company_name" TEXT,
    "merge_data" JSONB,
    "status" "CampaignRecipientStatus" NOT NULL DEFAULT 'PENDING',
    "sent_at" TIMESTAMP(3),
    "opened_at" TIMESTAMP(3),
    "clicked_at" TIMESTAMP(3),
    "replied_at" TIMESTAMP(3),
    "bounced_at" TIMESTAMP(3),
    "unsubscribed_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "open_count" INTEGER NOT NULL DEFAULT 0,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "email_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cmn_campaign_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cmn_email_tracking_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "email_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "clicked_url" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "device_type" TEXT,
    "location" TEXT,
    "campaign_id" TEXT,
    "recipient_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cmn_email_tracking_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cmn_email_unsubscribes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "contact_id" TEXT,
    "reason" TEXT,
    "campaign_id" TEXT,
    "unsubscribed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cmn_email_unsubscribes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cmn_wa_business_accounts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "waba_id" TEXT NOT NULL,
    "phone_number_id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "webhook_verify_token" TEXT NOT NULL,
    "api_version" TEXT NOT NULL DEFAULT 'v21.0',
    "connection_status" "WabaConnectionStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "last_connected_at" TIMESTAMP(3),
    "business_profile_photo" TEXT,
    "about_text" TEXT,
    "address" TEXT,
    "vertical_industry" TEXT,
    "website_url" TEXT,
    "auto_reply_enabled" BOOLEAN NOT NULL DEFAULT false,
    "auto_reply_message" TEXT,
    "business_hours_enabled" BOOLEAN NOT NULL DEFAULT false,
    "business_hours_config" JSONB,
    "welcome_message_enabled" BOOLEAN NOT NULL DEFAULT false,
    "welcome_message" TEXT,
    "total_conversations" INTEGER NOT NULL DEFAULT 0,
    "total_messages_sent" INTEGER NOT NULL DEFAULT 0,
    "total_messages_received" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cmn_wa_business_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cmn_wa_conversations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "waba_id" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "contact_name" TEXT,
    "contact_push_name" TEXT,
    "linked_entity_type" TEXT,
    "linked_entity_id" TEXT,
    "status" "WaConversationStatus" NOT NULL DEFAULT 'OPEN',
    "assigned_to_id" TEXT,
    "window_expires_at" TIMESTAMP(3),
    "is_window_open" BOOLEAN NOT NULL DEFAULT false,
    "last_message_at" TIMESTAMP(3),
    "last_message_snippet" TEXT,
    "last_message_direction" "WaMessageDirection",
    "unread_count" INTEGER NOT NULL DEFAULT 0,
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cmn_wa_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cmn_wa_messages" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "waba_id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "wa_message_id" TEXT,
    "direction" "WaMessageDirection" NOT NULL,
    "message_type" "WaMessageType" NOT NULL,
    "status" "WaMessageStatus" NOT NULL DEFAULT 'PENDING',
    "text_body" TEXT,
    "media_url" TEXT,
    "media_id" TEXT,
    "media_mime_type" TEXT,
    "media_caption" TEXT,
    "media_file_name" TEXT,
    "template_id" TEXT,
    "template_name" TEXT,
    "template_variables" JSONB,
    "interactive_type" TEXT,
    "interactive_data" JSONB,
    "button_reply_id" TEXT,
    "button_reply_title" TEXT,
    "list_reply_id" TEXT,
    "list_reply_title" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "location_name" TEXT,
    "location_address" TEXT,
    "reaction_emoji" TEXT,
    "reaction_message_id" TEXT,
    "contact_card_data" JSONB,
    "sent_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "context_message_id" TEXT,
    "is_forwarded" BOOLEAN NOT NULL DEFAULT false,
    "sender_user_id" TEXT,
    "broadcast_id" TEXT,
    "broadcast_recipient_id" TEXT,
    "is_chatbot_reply" BOOLEAN NOT NULL DEFAULT false,
    "chatbot_flow_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cmn_wa_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cmn_wa_templates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "waba_id" TEXT NOT NULL,
    "meta_template_id" TEXT,
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "category" "WaTemplateCategory" NOT NULL,
    "status" "WaTemplateStatus" NOT NULL DEFAULT 'PENDING',
    "header_type" TEXT,
    "header_content" TEXT,
    "body_text" TEXT NOT NULL,
    "footer_text" TEXT,
    "buttons" JSONB,
    "variables" JSONB,
    "sample_values" JSONB,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "delivered_count" INTEGER NOT NULL DEFAULT 0,
    "read_count" INTEGER NOT NULL DEFAULT 0,
    "replied_count" INTEGER NOT NULL DEFAULT 0,
    "last_synced_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cmn_wa_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cmn_wa_broadcasts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "waba_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "status" "WaBroadcastStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduled_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "throttle_per_second" INTEGER NOT NULL DEFAULT 10,
    "total_recipients" INTEGER NOT NULL DEFAULT 0,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "delivered_count" INTEGER NOT NULL DEFAULT 0,
    "read_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "opt_out_count" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" TEXT NOT NULL,
    "created_by_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cmn_wa_broadcasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cmn_wa_broadcast_recipients" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "broadcast_id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "contact_name" TEXT,
    "variables" JSONB,
    "status" "WaBroadcastRecipientStatus" NOT NULL DEFAULT 'PENDING',
    "wa_message_id" TEXT,
    "sent_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cmn_wa_broadcast_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cmn_wa_chatbot_flows" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "waba_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "WaChatbotFlowStatus" NOT NULL DEFAULT 'DRAFT',
    "trigger_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "nodes" JSONB NOT NULL DEFAULT '[]',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "triggered_count" INTEGER NOT NULL DEFAULT 0,
    "completed_count" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cmn_wa_chatbot_flows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cmn_wa_quick_replies" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "waba_id" TEXT NOT NULL,
    "shortcut" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cmn_wa_quick_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cmn_wa_opt_outs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "waba_id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "contact_id" TEXT,
    "reason" TEXT,
    "opted_out_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cmn_wa_opt_outs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cmn_email_footer_templates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "body_html" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cmn_email_footer_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cmn_communication_logs" (
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
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cmn_communication_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_brands" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_brand_organizations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "brand_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_brand_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_brand_contacts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "brand_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "role" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_brand_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_business_locations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "level" "LocationLevel" NOT NULL,
    "parent_id" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_business_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_company_countries" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "country_name" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "iso_code_3" TEXT,
    "phonecode" TEXT,
    "currency" TEXT,
    "currency_symbol" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_company_countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_company_states" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_country_id" TEXT NOT NULL,
    "state_name" TEXT NOT NULL,
    "state_code" TEXT NOT NULL,
    "gst_state_code" TEXT,
    "coverage_type" TEXT NOT NULL DEFAULT 'SPECIFIC',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_headquarter" BOOLEAN NOT NULL DEFAULT false,
    "state_gstin" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_company_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_company_cities" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_state_id" TEXT NOT NULL,
    "city_name" TEXT NOT NULL,
    "district" TEXT,
    "coverage_type" TEXT NOT NULL DEFAULT 'ALL',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_company_cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_company_pincodes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_city_id" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "area_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_company_pincodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_custom_field_definitions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "entity_type" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "field_label" TEXT NOT NULL,
    "field_type" TEXT NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "default_value" TEXT,
    "options" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_custom_field_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_entity_config_values" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "definition_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "value_text" TEXT,
    "value_number" DOUBLE PRECISION,
    "value_date" TIMESTAMP(3),
    "value_boolean" BOOLEAN,
    "value_json" JSONB,
    "value_dropdown" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_entity_config_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_sync_policies" (
    "id" TEXT NOT NULL,
    "entity_name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "direction" "SyncDirection" NOT NULL DEFAULT 'BIDIRECTIONAL',
    "sync_interval_minutes" INTEGER NOT NULL,
    "max_rows_offline" INTEGER,
    "max_storage_mb" INTEGER,
    "max_data_age_days" INTEGER,
    "conflict_strategy" "ConflictStrategy" NOT NULL DEFAULT 'LATEST_WINS',
    "download_scope" TEXT NOT NULL DEFAULT 'OWNED',
    "download_filter" JSONB,
    "sync_priority" INTEGER NOT NULL DEFAULT 5,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,

    CONSTRAINT "gv_cfg_sync_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_sync_warning_rules" (
    "id" TEXT NOT NULL,
    "policy_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" "SyncWarningTrigger" NOT NULL,
    "threshold_value" DECIMAL(10,2) NOT NULL,
    "threshold_unit" TEXT NOT NULL,
    "level_1_action" "SyncEnforcement" NOT NULL DEFAULT 'WARN_ONLY',
    "level_1_threshold" DECIMAL(10,2),
    "level_1_message" TEXT,
    "level_2_action" "SyncEnforcement",
    "level_2_threshold" DECIMAL(10,2),
    "level_2_message" TEXT,
    "level_2_delay_minutes" INTEGER,
    "level_3_action" "SyncEnforcement",
    "level_3_threshold" DECIMAL(10,2),
    "level_3_message" TEXT,
    "applies_to_roles" TEXT[],
    "applies_to_users" TEXT[],
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_sync_warning_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_sync_devices" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "device_name" TEXT,
    "device_type" TEXT,
    "platform" TEXT,
    "app_version" TEXT,
    "status" "DeviceStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_sync_at" TIMESTAMP(3),
    "last_heartbeat_at" TIMESTAMP(3),
    "last_ip_address" TEXT,
    "storage_used_mb" DECIMAL(10,2),
    "record_counts" JSONB,
    "pending_upload_count" INTEGER NOT NULL DEFAULT 0,
    "oldest_pending_at" TIMESTAMP(3),
    "entity_sync_state" JSONB,
    "pending_flush_id" TEXT,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_sync_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_sync_conflicts" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "entity_name" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "entity_label" TEXT,
    "client_data" JSONB NOT NULL,
    "server_data" JSONB NOT NULL,
    "base_data" JSONB,
    "client_modified_at" TIMESTAMP(3) NOT NULL,
    "server_modified_at" TIMESTAMP(3) NOT NULL,
    "conflicting_fields" JSONB NOT NULL,
    "non_conflicting_merge" JSONB,
    "status" "ConflictStatus" NOT NULL DEFAULT 'PENDING',
    "resolved_by" TEXT,
    "resolved_strategy" TEXT,
    "resolved_data" JSONB,
    "resolved_at" TIMESTAMP(3),
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_sync_conflicts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_sync_flush_commands" (
    "id" TEXT NOT NULL,
    "flush_type" "FlushType" NOT NULL,
    "target_user_id" TEXT,
    "target_device_id" TEXT,
    "target_entity" TEXT,
    "reason" TEXT NOT NULL,
    "redownload_after" BOOLEAN NOT NULL DEFAULT true,
    "status" "FlushStatus" NOT NULL DEFAULT 'PENDING',
    "acknowledged_at" TIMESTAMP(3),
    "executed_at" TIMESTAMP(3),
    "issued_by_id" TEXT NOT NULL,
    "issued_by_name" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_sync_flush_commands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_cron_job_configs" (
    "id" TEXT NOT NULL,
    "job_code" TEXT NOT NULL,
    "job_name" TEXT NOT NULL,
    "description" TEXT,
    "module_name" TEXT NOT NULL,
    "cron_expression" TEXT NOT NULL,
    "cron_description" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "scope" "CronJobScope" NOT NULL DEFAULT 'GLOBAL',
    "status" "CronJobStatus" NOT NULL DEFAULT 'ACTIVE',
    "timeout_seconds" INTEGER NOT NULL DEFAULT 300,
    "max_retries" INTEGER NOT NULL DEFAULT 0,
    "retry_delay_seconds" INTEGER NOT NULL DEFAULT 60,
    "allow_concurrent" BOOLEAN NOT NULL DEFAULT false,
    "is_running" BOOLEAN NOT NULL DEFAULT false,
    "last_run_at" TIMESTAMP(3),
    "last_run_status" "CronRunStatus",
    "last_run_duration_ms" INTEGER,
    "last_run_error" TEXT,
    "last_run_records" INTEGER,
    "next_run_at" TIMESTAMP(3),
    "total_run_count" INTEGER NOT NULL DEFAULT 0,
    "total_fail_count" INTEGER NOT NULL DEFAULT 0,
    "avg_duration_ms" INTEGER,
    "success_rate" DECIMAL(5,2),
    "alert_on_failure" BOOLEAN NOT NULL DEFAULT true,
    "alert_on_timeout" BOOLEAN NOT NULL DEFAULT true,
    "alert_after_consecutive_failures" INTEGER NOT NULL DEFAULT 3,
    "consecutive_failures" INTEGER NOT NULL DEFAULT 0,
    "alert_channel" "CronAlertChannel" NOT NULL DEFAULT 'BOTH',
    "alert_recipient_emails" TEXT[],
    "alert_recipient_user_ids" TEXT[],
    "job_params" JSONB,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_cfg_cron_job_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_business_hours_schedules" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "is_working_day" BOOLEAN NOT NULL DEFAULT true,
    "start_time" TEXT,
    "end_time" TEXT,
    "break_start_time" TEXT,
    "break_end_time" TEXT,
    "shift_2_start_time" TEXT,
    "shift_2_end_time" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_business_hours_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_holiday_calendars" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "type" "HolidayType" NOT NULL DEFAULT 'COMPANY',
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "applicable_states" TEXT[],
    "is_half_day" BOOLEAN NOT NULL DEFAULT false,
    "half_day_end" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_holiday_calendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_calendar_highlights" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "date" DATE NOT NULL,
    "title" TEXT NOT NULL,
    "highlight_type" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#7C3AED',
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurring_type" TEXT,
    "is_holiday" BOOLEAN NOT NULL DEFAULT false,
    "industry_code" TEXT,
    "state_code" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_calendar_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_auto_number_sequences" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "entity_name" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "format_pattern" TEXT NOT NULL,
    "current_sequence" INTEGER NOT NULL DEFAULT 0,
    "seq_padding" INTEGER NOT NULL DEFAULT 5,
    "start_from" INTEGER NOT NULL DEFAULT 1,
    "increment_by" INTEGER NOT NULL DEFAULT 1,
    "resetPolicy" "SequenceResetPolicy" NOT NULL DEFAULT 'YEARLY',
    "last_reset_at" TIMESTAMP(3),
    "last_reset_sequence" INTEGER,
    "sample_number" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "updated_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,

    CONSTRAINT "gv_cfg_auto_number_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_company_profiles" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "legal_name" TEXT,
    "trade_name" TEXT,
    "tagline" TEXT,
    "industry" TEXT,
    "company_size" TEXT,
    "founded_year" INTEGER,
    "website" TEXT,
    "phone" TEXT,
    "alternate_phone" TEXT,
    "email" TEXT,
    "support_email" TEXT,
    "billing_email" TEXT,
    "address_line_1" TEXT,
    "address_line_2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT DEFAULT 'India',
    "pincode" TEXT,
    "reg_address_line_1" TEXT,
    "reg_address_line_2" TEXT,
    "reg_city" TEXT,
    "reg_state" TEXT,
    "reg_country" TEXT,
    "reg_pincode" TEXT,
    "gst_number" TEXT,
    "pan_number" TEXT,
    "tan_number" TEXT,
    "cin_number" TEXT,
    "msme_number" TEXT,
    "import_export_code" TEXT,
    "bank_name" TEXT,
    "bank_branch" TEXT,
    "account_number" TEXT,
    "ifsc_code" TEXT,
    "account_type" TEXT,
    "upi_id" TEXT,
    "linkedin_url" TEXT,
    "facebook_url" TEXT,
    "twitter_url" TEXT,
    "instagram_url" TEXT,
    "youtube_url" TEXT,
    "state_code" TEXT,
    "country_code" TEXT NOT NULL DEFAULT 'IN',
    "gst_state_code" TEXT,
    "landmark" TEXT,
    "tan" TEXT,
    "cin" TEXT,
    "msme_type" TEXT,
    "tax_type" TEXT NOT NULL DEFAULT 'GST',
    "composition_scheme" BOOLEAN NOT NULL DEFAULT false,
    "reverse_charge_mechanism" BOOLEAN NOT NULL DEFAULT false,
    "financial_year_start" INTEGER NOT NULL DEFAULT 4,
    "financial_year_end" INTEGER NOT NULL DEFAULT 3,
    "current_financial_year" TEXT,
    "working_pattern" TEXT NOT NULL DEFAULT 'STANDARD',
    "working_days" TEXT[] DEFAULT ARRAY['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']::TEXT[],
    "working_hours_start" TEXT,
    "working_hours_end" TEXT,
    "week_off" TEXT[] DEFAULT ARRAY['SUN']::TEXT[],
    "accounting_method" TEXT NOT NULL DEFAULT 'ACCRUAL',
    "balancing_method" TEXT NOT NULL DEFAULT 'BILL_BY_BILL',
    "decimal_places" INTEGER NOT NULL DEFAULT 2,
    "number_format" TEXT NOT NULL DEFAULT 'INDIAN',
    "currency_code" TEXT NOT NULL DEFAULT 'INR',
    "currency_symbol" TEXT NOT NULL DEFAULT '₹',
    "inventory_method" TEXT NOT NULL DEFAULT 'FIFO',
    "negative_stock_allowed" BOOLEAN NOT NULL DEFAULT false,
    "auto_stock_deduction" BOOLEAN NOT NULL DEFAULT true,
    "batch_tracking" BOOLEAN NOT NULL DEFAULT false,
    "serial_tracking" BOOLEAN NOT NULL DEFAULT true,
    "expiry_tracking" BOOLEAN NOT NULL DEFAULT false,
    "invoice_prefix" TEXT,
    "invoice_start_number" INTEGER NOT NULL DEFAULT 1,
    "purchase_prefix" TEXT,
    "purchase_start_number" INTEGER NOT NULL DEFAULT 1,
    "quotation_prefix" TEXT,
    "quotation_start_number" INTEGER NOT NULL DEFAULT 1,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "locale" TEXT NOT NULL DEFAULT 'en-IN',
    "date_format" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "time_format" TEXT NOT NULL DEFAULT '12h',
    "default_terms" TEXT,
    "default_notes" TEXT,
    "logo_url" TEXT,
    "updated_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,

    CONSTRAINT "gv_cfg_company_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_notion_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "database_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "updated_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,

    CONSTRAINT "gv_cfg_notion_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_api_keys" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "key_prefix" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "key_last_four" TEXT NOT NULL,
    "status" "ApiKeyStatus" NOT NULL DEFAULT 'API_ACTIVE',
    "expires_at" TIMESTAMP(3),
    "scopes" TEXT[],
    "rate_limit_per_hour" INTEGER,
    "rate_limit_per_day" INTEGER,
    "rate_limit_per_minute" INTEGER,
    "allowed_ips" TEXT[],
    "environment" TEXT NOT NULL DEFAULT 'live',
    "last_used_at" TIMESTAMP(3),
    "total_requests" INTEGER NOT NULL DEFAULT 0,
    "requests_today" INTEGER NOT NULL DEFAULT 0,
    "requests_this_hour" INTEGER NOT NULL DEFAULT 0,
    "last_reset_date" TIMESTAMP(3),
    "last_reset_hour" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "created_by_name" TEXT NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "revoked_by_id" TEXT,
    "revoked_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_webhook_endpoints" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "secret" TEXT NOT NULL,
    "events" TEXT[],
    "status" "WebhookStatus" NOT NULL DEFAULT 'WH_ACTIVE',
    "api_version" TEXT NOT NULL DEFAULT 'v1',
    "content_type" TEXT NOT NULL DEFAULT 'application/json',
    "timeout_seconds" INTEGER NOT NULL DEFAULT 30,
    "max_retries" INTEGER NOT NULL DEFAULT 5,
    "custom_headers" JSONB,
    "consecutive_failures" INTEGER NOT NULL DEFAULT 0,
    "last_delivered_at" TIMESTAMP(3),
    "last_failed_at" TIMESTAMP(3),
    "last_error" TEXT,
    "total_delivered" INTEGER NOT NULL DEFAULT 0,
    "total_failed" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" TEXT NOT NULL,
    "created_by_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_webhook_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_webhook_deliveries" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "endpoint_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "payload_size" INTEGER,
    "status" "WebhookDeliveryStatus" NOT NULL DEFAULT 'WH_PENDING',
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "http_status" INTEGER,
    "response_body" TEXT,
    "response_time_ms" INTEGER,
    "error" TEXT,
    "signature" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "delivered_at" TIMESTAMP(3),
    "next_retry_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_rate_limit_tiers" (
    "id" TEXT NOT NULL,
    "plan_code" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "requests_per_minute" INTEGER NOT NULL,
    "requests_per_hour" INTEGER NOT NULL,
    "requests_per_day" INTEGER NOT NULL,
    "max_api_keys" INTEGER NOT NULL,
    "max_webhook_endpoints" INTEGER NOT NULL,
    "burst_limit" INTEGER NOT NULL DEFAULT 10,
    "burst_window_seconds" INTEGER NOT NULL DEFAULT 1,
    "webhook_rate_per_minute" INTEGER NOT NULL,
    "max_response_size_kb" INTEGER NOT NULL DEFAULT 5120,
    "max_request_body_kb" INTEGER NOT NULL DEFAULT 1024,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_cfg_rate_limit_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_table_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "table_key" TEXT NOT NULL,
    "user_id" TEXT,
    "config" JSONB NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_table_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_data_masking_policies" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "table_key" TEXT NOT NULL,
    "column_id" TEXT NOT NULL,
    "role_id" TEXT,
    "user_id" TEXT,
    "mask_type" TEXT NOT NULL DEFAULT 'FULL',
    "can_unmask" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_data_masking_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_quiet_hour_configs" (
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
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_quiet_hour_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_user_calendar_syncs" (
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
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_user_calendar_syncs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_user_availability" (
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
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_user_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_blocked_slots" (
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
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_blocked_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_calendar_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "config_key" TEXT NOT NULL,
    "config_value" JSONB NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "updated_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,

    CONSTRAINT "gv_cfg_calendar_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_google_connections" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar_url" TEXT,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "token_expires_at" TIMESTAMP(3),
    "services" JSONB NOT NULL DEFAULT '[]',
    "calendar_settings" JSONB,
    "contacts_settings" JSONB,
    "last_sync_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_google_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_ai_settings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "default_provider" TEXT NOT NULL DEFAULT 'ANTHROPIC_CLAUDE',
    "default_model" TEXT NOT NULL DEFAULT 'claude-sonnet-4-20250514',
    "task_overrides" JSONB,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "monthly_token_budget" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_ai_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_shortcut_definitions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'COMMON',
    "action_type" TEXT NOT NULL DEFAULT 'NAVIGATE',
    "target_path" TEXT,
    "target_module" TEXT,
    "target_function" TEXT,
    "default_key" TEXT NOT NULL,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_shortcut_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_shortcut_user_overrides" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "user_id" TEXT NOT NULL,
    "shortcut_id" TEXT NOT NULL,
    "custom_key" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_shortcut_user_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_ai_models" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "source" "AiModelSource" NOT NULL DEFAULT 'OLLAMA',
    "status" "AiModelStatus" NOT NULL DEFAULT 'NOT_INSTALLED',
    "size_bytes" BIGINT NOT NULL DEFAULT 0,
    "parameter_count" TEXT,
    "context_length" INTEGER NOT NULL DEFAULT 4096,
    "capabilities" JSONB NOT NULL DEFAULT '[]',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_embedding" BOOLEAN NOT NULL DEFAULT false,
    "download_progress" DOUBLE PRECISION,
    "last_used_at" TIMESTAMP(3),
    "config_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_ai_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_ai_datasets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "source_type" TEXT NOT NULL DEFAULT 'MANUAL',
    "entity_type" TEXT,
    "status" "AiDatasetStatus" NOT NULL DEFAULT 'DRAFT',
    "document_count" INTEGER NOT NULL DEFAULT 0,
    "total_chunks" INTEGER NOT NULL DEFAULT 0,
    "total_tokens" INTEGER NOT NULL DEFAULT 0,
    "config_json" JSONB,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_ai_datasets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_ai_documents" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "dataset_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "content_type" TEXT NOT NULL DEFAULT 'text',
    "source_url" TEXT,
    "chunk_count" INTEGER NOT NULL DEFAULT 0,
    "token_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "is_processed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_ai_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_ai_training_jobs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "dataset_id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "status" "AiTrainingJobStatus" NOT NULL DEFAULT 'QUEUED',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_steps" INTEGER NOT NULL DEFAULT 0,
    "completed_steps" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "config_json" JSONB,
    "result_json" JSONB,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_ai_training_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_ai_embeddings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "dataset_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "chunk_index" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT NOT NULL,
    "embedding" TEXT NOT NULL,
    "token_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_ai_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_ai_chat_sessions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "user_id" TEXT,
    "title" TEXT NOT NULL DEFAULT 'New Chat',
    "model_id" TEXT NOT NULL,
    "dataset_ids" JSONB NOT NULL DEFAULT '[]',
    "system_prompt_id" TEXT,
    "status" "AiChatSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "config_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_ai_chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_ai_chat_messages" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "session_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sources" JSONB,
    "token_count" INTEGER NOT NULL DEFAULT 0,
    "latency_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_ai_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_ai_system_prompts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "prompt" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "variables" JSONB NOT NULL DEFAULT '[]',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_ai_system_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_control_room_rules" (
    "id" TEXT NOT NULL,
    "rule_code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "sub_category" TEXT,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "help_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "value_type" TEXT NOT NULL,
    "default_value" TEXT,
    "select_options" JSONB,
    "min_value" DECIMAL(12,2),
    "max_value" DECIMAL(12,2),
    "allowed_levels" JSONB NOT NULL DEFAULT '["INDUSTRY","CONTROL_ROOM"]',
    "applicable_modules" JSONB,
    "industry_specific" BOOLEAN NOT NULL DEFAULT false,
    "requires_module" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_cfg_control_room_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_control_room_values" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "rule_id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "page_code" TEXT,
    "role_id" TEXT,
    "user_id" TEXT,
    "industry_code" TEXT,
    "set_by_user_id" TEXT,
    "set_by_user_name" TEXT,
    "set_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_control_room_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_rule_cache_versions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "last_changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_changed_by" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_rule_cache_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_control_room_drafts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "rule_code" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "previous_value" TEXT,
    "new_value" TEXT NOT NULL,
    "page_code" TEXT,
    "role_id" TEXT,
    "user_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_by_user_id" TEXT NOT NULL,
    "created_by_user_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_cfg_control_room_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_cfg_saved_filters" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "entity_type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "filter_config" JSONB NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_shared" BOOLEAN NOT NULL DEFAULT false,
    "shared_with_roles" JSONB,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "last_used_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_cfg_saved_filters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_raw_contacts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "source" "RawContactSource" NOT NULL DEFAULT 'MANUAL',
    "status" "RawContactStatus" NOT NULL DEFAULT 'RAW',
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "designation" TEXT,
    "department" TEXT,
    "company_name" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "entity_verification_status" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "entity_verified_via" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "verified_at" TIMESTAMP(3),
    "verified_by_id" TEXT,
    "contact_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_raw_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_raw_contact_filters" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "raw_contact_id" TEXT NOT NULL,
    "lookup_value_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_raw_contact_filters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_contacts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "designation" TEXT,
    "department" TEXT,
    "notes" TEXT,
    "data_status" "DataStatus" NOT NULL DEFAULT 'COMPLETE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "entity_verification_status" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "entity_verified_at" TIMESTAMP(3),
    "entity_verified_via" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "organization_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,
    "vertical_data" JSONB DEFAULT '{}',

    CONSTRAINT "gv_crm_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_contact_filters" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "contact_id" TEXT NOT NULL,
    "lookup_value_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_contact_filters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_organizations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "gst_number" TEXT,
    "industry" TEXT,
    "annual_revenue" DOUBLE PRECISION,
    "org_type" "OrgType" NOT NULL DEFAULT 'GENERAL',
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "pincode" TEXT,
    "notes" TEXT,
    "data_status" "DataStatus" NOT NULL DEFAULT 'COMPLETE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "entity_verification_status" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "entity_verified_at" TIMESTAMP(3),
    "entity_verified_via" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_organization_filters" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "organization_id" TEXT NOT NULL,
    "lookup_value_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_organization_filters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_contact_organizations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "contact_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "relation_type" "ContactOrgRelationType" NOT NULL DEFAULT 'EMPLOYEE',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "designation" TEXT,
    "department" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_contact_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_communications" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "type" "CommunicationType" NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT,
    "priority_type" "PriorityType" NOT NULL DEFAULT 'PRIMARY',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "raw_contact_id" TEXT,
    "contact_id" TEXT,
    "organization_id" TEXT,
    "lead_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_communications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_leads" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "lead_number" TEXT NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "priority" "LeadPriority" NOT NULL DEFAULT 'MEDIUM',
    "expected_value" DECIMAL(12,2),
    "expected_close_date" TIMESTAMP(3),
    "lost_reason" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "contact_id" TEXT NOT NULL,
    "organization_id" TEXT,
    "allocated_to_id" TEXT,
    "allocated_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,
    "vertical_data" JSONB DEFAULT '{}',

    CONSTRAINT "gv_crm_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_lead_filters" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "lead_id" TEXT NOT NULL,
    "lookup_value_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_lead_filters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_activities" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "type" "ActivityType" NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "outcome" TEXT,
    "duration" INTEGER,
    "scheduled_at" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "location_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "lead_id" TEXT,
    "contact_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_demos" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "mode" "DemoMode" NOT NULL,
    "status" "DemoStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "duration" INTEGER,
    "meeting_link" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "outcome" TEXT,
    "result" "DemoResult",
    "reschedule_count" INTEGER NOT NULL DEFAULT 0,
    "cancel_reason" TEXT,
    "no_show_reason" TEXT,
    "lead_id" TEXT NOT NULL,
    "conducted_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_demos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_tour_plans" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "plan_date" TIMESTAMP(3) NOT NULL,
    "status" "TourPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejected_reason" TEXT,
    "check_in_time" TIMESTAMP(3),
    "check_out_time" TIMESTAMP(3),
    "check_in_lat" DECIMAL(10,7),
    "check_in_lng" DECIMAL(10,7),
    "check_out_lat" DECIMAL(10,7),
    "check_out_lng" DECIMAL(10,7),
    "check_in_photo" TEXT,
    "start_location" TEXT,
    "end_location" TEXT,
    "lead_id" TEXT NOT NULL,
    "sales_person_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_tour_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_entity_owners" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "entity_type" "EntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "owner_type" "OwnerType" NOT NULL,
    "user_id" TEXT,
    "team_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_to" TIMESTAMP(3),
    "assigned_by_id" TEXT NOT NULL,
    "assignment_reason" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "config_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_entity_owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_ownership_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "entity_type" "EntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" "OwnershipAction" NOT NULL,
    "owner_type" "OwnerType" NOT NULL,
    "from_user_id" TEXT,
    "from_user_name" TEXT,
    "to_user_id" TEXT,
    "to_user_name" TEXT,
    "reason_code" TEXT NOT NULL,
    "reason_detail" TEXT,
    "changed_by_id" TEXT NOT NULL,
    "changed_by_name" TEXT NOT NULL,
    "is_automated" BOOLEAN NOT NULL DEFAULT false,
    "ownership_duration_days" INTEGER,
    "entity_snapshot" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_ownership_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_assignment_rules" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "entity_type" "EntityType" NOT NULL,
    "trigger_event" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "assignment_method" "AssignmentMethod" NOT NULL,
    "assign_to_user_id" TEXT,
    "assign_to_team_ids" TEXT[],
    "assign_to_role_id" TEXT,
    "owner_type" "OwnerType" NOT NULL DEFAULT 'PRIMARY_OWNER',
    "last_assigned_index" INTEGER NOT NULL DEFAULT 0,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "status" "AssignmentRuleStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "max_per_user" INTEGER,
    "respect_workload" BOOLEAN NOT NULL DEFAULT false,
    "escalate_after_hours" INTEGER,
    "escalate_to_user_id" TEXT,
    "escalate_to_role_id" TEXT,
    "execution_count" INTEGER NOT NULL DEFAULT 0,
    "last_executed_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_assignment_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_manufacturers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "country" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_manufacturers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_manufacturer_organizations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "manufacturer_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_manufacturer_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_manufacturer_contacts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "manufacturer_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "role" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_manufacturer_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_organization_locations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "organization_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_organization_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_follow_ups" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "due_date" TIMESTAMP(3) NOT NULL,
    "priority" "FollowUpPriority" NOT NULL DEFAULT 'MEDIUM',
    "assigned_to_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3),
    "snoozed_until" TIMESTAMP(3),
    "is_overdue" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_recurring_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "pattern" "RecurrencePattern" NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "days_of_week" JSONB,
    "day_of_month" INTEGER,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "next_occurrence" TIMESTAMP(3) NOT NULL,
    "last_generated" TIMESTAMP(3),
    "max_occurrences" INTEGER,
    "occurrence_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" TEXT NOT NULL,
    "template_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_recurring_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_tour_plan_visits" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "tour_plan_id" TEXT NOT NULL,
    "lead_id" TEXT,
    "contact_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "scheduled_time" TIMESTAMP(3),
    "actual_arrival" TIMESTAMP(3),
    "actual_departure" TIMESTAMP(3),
    "check_in_lat" DECIMAL(10,7),
    "check_in_lng" DECIMAL(10,7),
    "check_out_lat" DECIMAL(10,7),
    "check_out_lng" DECIMAL(10,7),
    "check_in_photo" TEXT,
    "check_out_photo" TEXT,
    "distance_from_target" DOUBLE PRECISION,
    "notes" TEXT,
    "outcome" TEXT,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_tour_plan_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_tour_plan_photos" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "tour_plan_visit_id" TEXT NOT NULL,
    "photo_url" TEXT NOT NULL,
    "photo_type" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_tour_plan_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_calendar_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "event_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "all_day" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT,
    "user_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_support_tickets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "reported_by_id" TEXT NOT NULL,
    "ticket_no" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "TicketCategory" NOT NULL,
    "priority" "TicketPriority" NOT NULL,
    "screenshots" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "auto_context" JSONB,
    "assigned_to_id" TEXT,
    "assigned_to_name" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "resolved_at" TIMESTAMP(3),
    "resolution" TEXT,
    "closed_at" TIMESTAMP(3),
    "satisfaction_rating" INTEGER,
    "satisfaction_comment" TEXT,
    "linked_error_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "first_response_at" TIMESTAMP(3),
    "sla_breached" BOOLEAN NOT NULL DEFAULT false,
    "reported_by_name" TEXT,
    "reported_by_email" TEXT,
    "tenant_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_support_ticket_messages" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "sender_name" TEXT,
    "senderType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gv_crm_support_ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_tasks" (
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
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejected_reason" TEXT,
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
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_task_history" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "task_id" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'UPDATED',
    "field" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "changed_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_task_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_task_watchers" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gv_crm_task_watchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_comments" (
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
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_task_logic_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "config_key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updated_by_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,

    CONSTRAINT "gv_crm_task_logic_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_scheduled_events" (
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
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_scheduled_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_event_participants" (
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
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_event_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_event_history" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "event_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "field" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "changed_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_event_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_entity_verification_records" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "entity_name" TEXT,
    "mode" "EntityVerificationMode" NOT NULL,
    "channel" "EntityVerificationChannel" NOT NULL,
    "otp" TEXT,
    "otp_expires_at" TIMESTAMP(3),
    "otp_attempts" INTEGER NOT NULL DEFAULT 0,
    "verification_token" TEXT,
    "link_expires_at" TIMESTAMP(3),
    "link_url" TEXT,
    "sent_to_email" TEXT,
    "sent_to_mobile" TEXT,
    "status" "EntityVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verified_by_type" "VerifiedByType",
    "verified_by_user_id" TEXT,
    "verified_by_user_name" TEXT,
    "verified_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_entity_verification_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_warranty_templates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "application_type" TEXT NOT NULL DEFAULT 'PRODUCT',
    "product_id" TEXT,
    "category_id" TEXT,
    "duration_value" INTEGER NOT NULL,
    "duration_type" TEXT NOT NULL,
    "start_from" TEXT NOT NULL DEFAULT 'SALE_DATE',
    "coverage_type" TEXT NOT NULL DEFAULT 'FULL',
    "inclusions" JSONB NOT NULL DEFAULT '[]',
    "exclusions" JSONB NOT NULL DEFAULT '[]',
    "support_channels" JSONB NOT NULL DEFAULT '[]',
    "location_type" TEXT,
    "max_claims" INTEGER,
    "max_claims_period" TEXT,
    "service_charge" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "labor_charge_type" TEXT NOT NULL DEFAULT 'FREE',
    "labor_charge_amount" DECIMAL(10,2),
    "parts_charge_type" TEXT NOT NULL DEFAULT 'FREE',
    "parts_charge_markup" DECIMAL(5,2),
    "response_time_sla_hours" INTEGER,
    "resolution_sla_days" INTEGER,
    "is_transferable" BOOLEAN NOT NULL DEFAULT false,
    "extension_available" BOOLEAN NOT NULL DEFAULT false,
    "extension_price" DECIMAL(10,2),
    "extension_duration" INTEGER,
    "extension_duration_type" TEXT,
    "industry_code" TEXT,
    "is_system_template" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_warranty_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_warranty_records" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "warranty_template_id" TEXT NOT NULL,
    "warranty_number" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "customer_type" TEXT NOT NULL,
    "customer_name" TEXT,
    "product_id" TEXT NOT NULL,
    "product_name" TEXT,
    "serial_master_id" TEXT,
    "invoice_id" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "claims_used" INTEGER NOT NULL DEFAULT 0,
    "extended_until" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_warranty_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_warranty_claims" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "warranty_record_id" TEXT NOT NULL,
    "claim_number" TEXT NOT NULL,
    "issue_description" TEXT NOT NULL,
    "issue_category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "assigned_to_id" TEXT,
    "assigned_to_name" TEXT,
    "visit_type" TEXT,
    "visit_date" TIMESTAMP(3),
    "resolved_date" TIMESTAMP(3),
    "parts_used" JSONB,
    "labor_hours" DECIMAL(5,2),
    "is_covered" BOOLEAN NOT NULL DEFAULT true,
    "charge_amount" DECIMAL(10,2),
    "rejection_reason" TEXT,
    "technician_notes" TEXT,
    "customer_feedback" TEXT,
    "satisfaction_rating" INTEGER,
    "photos" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_warranty_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_amc_plan_templates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "plan_tier" TEXT NOT NULL,
    "description" TEXT,
    "duration_value" INTEGER NOT NULL,
    "duration_type" TEXT NOT NULL,
    "charges" DECIMAL(12,2) NOT NULL,
    "billing_cycle" TEXT NOT NULL,
    "free_visits" INTEGER NOT NULL DEFAULT 0,
    "free_online_support" INTEGER NOT NULL DEFAULT 0,
    "free_call_support" INTEGER NOT NULL DEFAULT 0,
    "visit_schedule_type" TEXT,
    "visit_schedule_value" INTEGER,
    "after_free_visit_charge" DECIMAL(10,2),
    "after_free_call_charge" DECIMAL(10,2),
    "after_free_online_charge" DECIMAL(10,2),
    "parts_included" JSONB NOT NULL DEFAULT '[]',
    "parts_excluded" JSONB NOT NULL DEFAULT '[]',
    "excluded_parts_charge_type" TEXT,
    "parts_charge_markup" DECIMAL(5,2),
    "coverage_product_ids" JSONB,
    "coverage_category_ids" JSONB,
    "sla_response_hours" INTEGER,
    "sla_resolution_days" INTEGER,
    "penalty_per_day" DECIMAL(10,2),
    "renewal_discount" DECIMAL(5,2),
    "grace_period_days" INTEGER,
    "auto_renew" BOOLEAN NOT NULL DEFAULT false,
    "industry_code" TEXT,
    "is_system_template" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_amc_plan_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_amc_contracts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "amc_plan_id" TEXT NOT NULL,
    "contract_number" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "customer_type" TEXT NOT NULL,
    "customer_name" TEXT,
    "product_ids" JSONB NOT NULL DEFAULT '[]',
    "serial_ids" JSONB NOT NULL DEFAULT '[]',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "total_amount" DECIMAL(12,2) NOT NULL,
    "paid_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "balance_amount" DECIMAL(12,2) NOT NULL,
    "billing_cycle" TEXT NOT NULL,
    "next_billing_date" TIMESTAMP(3),
    "free_visits_used" INTEGER NOT NULL DEFAULT 0,
    "free_visits_total" INTEGER NOT NULL,
    "free_calls_used" INTEGER NOT NULL DEFAULT 0,
    "free_calls_total" INTEGER NOT NULL,
    "free_online_used" INTEGER NOT NULL DEFAULT 0,
    "free_online_total" INTEGER NOT NULL,
    "renewed_from_id" TEXT,
    "auto_renew" BOOLEAN NOT NULL DEFAULT false,
    "renewal_reminder_sent" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_amc_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_amc_schedules" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "amc_contract_id" TEXT NOT NULL,
    "schedule_date" TIMESTAMP(3) NOT NULL,
    "schedule_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "assigned_to_id" TEXT,
    "assigned_to_name" TEXT,
    "completed_date" TIMESTAMP(3),
    "service_notes" TEXT,
    "parts_used" JSONB,
    "customer_signature" TEXT,
    "next_schedule_date" TIMESTAMP(3),
    "usage_at_visit" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_amc_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_service_visit_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "visit_number" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT,
    "customer_id" TEXT NOT NULL,
    "customer_name" TEXT,
    "technician_id" TEXT,
    "technician_name" TEXT,
    "visit_date" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "visit_type" TEXT NOT NULL,
    "issue_reported" TEXT,
    "work_done" TEXT,
    "parts_used" JSONB,
    "is_billable" BOOLEAN NOT NULL DEFAULT false,
    "charge_amount" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "customer_feedback" TEXT,
    "rating" INTEGER,
    "photos" JSONB NOT NULL DEFAULT '[]',
    "signature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_service_visit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_crm_service_charges" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "service_visit_id" TEXT NOT NULL,
    "charge_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "is_covered_by_warranty" BOOLEAN NOT NULL DEFAULT false,
    "is_covered_by_amc" BOOLEAN NOT NULL DEFAULT false,
    "invoice_id" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_crm_service_charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_doc_import_profiles" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "source_system" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "target_entity" "ImportTargetEntity" NOT NULL,
    "expected_headers" TEXT[],
    "header_match_mode" TEXT NOT NULL DEFAULT 'FLEXIBLE',
    "field_mapping" JSONB NOT NULL,
    "default_values" JSONB,
    "validation_rules" JSONB,
    "duplicate_check_fields" TEXT[],
    "duplicate_strategy" "DuplicateStrategy" NOT NULL DEFAULT 'ASK_PER_ROW',
    "fuzzy_match_enabled" BOOLEAN NOT NULL DEFAULT false,
    "fuzzy_match_fields" TEXT[],
    "fuzzy_threshold" DECIMAL(3,2) NOT NULL DEFAULT 0.85,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "last_used_at" TIMESTAMP(3),
    "total_imported" INTEGER NOT NULL DEFAULT 0,
    "avg_success_rate" DECIMAL(5,2),
    "status" "ProfileStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" TEXT NOT NULL,
    "created_by_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_doc_import_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_doc_import_jobs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_url" TEXT,
    "target_entity" "ImportTargetEntity" NOT NULL,
    "profile_id" TEXT,
    "profile_match_score" DECIMAL(5,2),
    "used_auto_mapping" BOOLEAN NOT NULL DEFAULT false,
    "status" "ImportJobStatus" NOT NULL DEFAULT 'UPLOADING',
    "file_headers" TEXT[],
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "sample_data" JSONB,
    "field_mapping" JSONB,
    "duplicate_check_fields" TEXT[],
    "duplicate_strategy" "DuplicateStrategy" NOT NULL DEFAULT 'ASK_PER_ROW',
    "fuzzy_match_enabled" BOOLEAN NOT NULL DEFAULT false,
    "fuzzy_match_fields" TEXT[],
    "fuzzy_threshold" DECIMAL(3,2) NOT NULL DEFAULT 0.85,
    "validation_rules" JSONB,
    "default_values" JSONB,
    "valid_rows" INTEGER NOT NULL DEFAULT 0,
    "invalid_rows" INTEGER NOT NULL DEFAULT 0,
    "duplicate_exact_rows" INTEGER NOT NULL DEFAULT 0,
    "duplicate_fuzzy_rows" INTEGER NOT NULL DEFAULT 0,
    "duplicate_in_file_rows" INTEGER NOT NULL DEFAULT 0,
    "skipped_rows" INTEGER NOT NULL DEFAULT 0,
    "imported_count" INTEGER NOT NULL DEFAULT 0,
    "updated_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "result_report_url" TEXT,
    "failed_rows_report_url" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_by_name" TEXT NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_doc_import_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_doc_import_rows" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "import_job_id" TEXT NOT NULL,
    "row_number" INTEGER NOT NULL,
    "row_data" JSONB NOT NULL,
    "mapped_data" JSONB,
    "row_status" "ImportRowStatus" NOT NULL DEFAULT 'PENDING',
    "validation_errors" JSONB,
    "validation_warnings" JSONB,
    "is_duplicate" BOOLEAN NOT NULL DEFAULT false,
    "duplicate_type" TEXT,
    "duplicate_of_entity_id" TEXT,
    "duplicate_of_row_number" INTEGER,
    "duplicate_match_field" TEXT,
    "duplicate_match_value" TEXT,
    "fuzzy_match_score" DECIMAL(5,4),
    "fuzzy_match_details" JSONB,
    "patch_preview" JSONB,
    "user_action" TEXT,
    "user_edited_data" JSONB,
    "imported_entity_id" TEXT,
    "import_action" TEXT,
    "import_error" TEXT,
    "imported_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_doc_import_rows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_doc_export_jobs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "target_entity" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "filters" JSONB,
    "columns" TEXT[],
    "status" "ExportStatus" NOT NULL DEFAULT 'PROCESSING',
    "record_count" INTEGER NOT NULL DEFAULT 0,
    "file_url" TEXT,
    "file_size" INTEGER,
    "created_by_id" TEXT NOT NULL,
    "created_by_name" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_doc_export_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_doc_documents" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "file_name" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "storage_type" "StorageType" NOT NULL,
    "storage_provider" "StorageProvider" NOT NULL DEFAULT 'NONE',
    "storage_path" TEXT,
    "storage_url" TEXT,
    "cloud_file_id" TEXT,
    "thumbnail_url" TEXT,
    "category" "DocumentCategory" NOT NULL DEFAULT 'GENERAL',
    "status" "DocumentStatus" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "parent_version_id" TEXT,
    "folder_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "uploaded_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_doc_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_doc_attachments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "document_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "attached_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_doc_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_doc_folders" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parent_id" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_doc_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_doc_cloud_connections" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "provider" "StorageProvider" NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "token_expiry" TIMESTAMP(3),
    "account_email" TEXT,
    "account_name" TEXT,
    "status" "CloudConnectionStatus" NOT NULL DEFAULT 'CONNECTED',
    "last_sync_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_doc_cloud_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_doc_share_links" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "document_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "access" "ShareLinkAccess" NOT NULL DEFAULT 'VIEW',
    "password" TEXT,
    "expires_at" TIMESTAMP(3),
    "max_views" INTEGER,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_doc_share_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_doc_activities" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "document_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "user_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_doc_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_doc_templates" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "document_type" "DocumentType" NOT NULL,
    "template_version" INTEGER NOT NULL DEFAULT 1,
    "html_template" TEXT NOT NULL,
    "canvas_json" JSONB,
    "css_styles" TEXT,
    "default_settings" JSONB NOT NULL DEFAULT '{}',
    "available_fields" JSONB NOT NULL DEFAULT '[]',
    "industry_code" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT true,
    "tenant_id" TEXT,
    "thumbnail_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_doc_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_doc_tenant_template_customizations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "custom_settings" JSONB NOT NULL DEFAULT '{}',
    "custom_header" TEXT,
    "custom_footer" TEXT,
    "terms_and_conditions" TEXT,
    "bank_details" TEXT,
    "signature_url" TEXT,
    "logo_url" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_doc_tenant_template_customizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_products" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "short_description" TEXT,
    "description" TEXT,
    "parent_id" TEXT,
    "is_master" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "images" JSONB,
    "brochure_url" TEXT,
    "video_url" TEXT,
    "mrp" DECIMAL(12,2),
    "sale_price" DECIMAL(12,2),
    "purchase_price" DECIMAL(12,2),
    "cost_price" DECIMAL(12,2),
    "tax_type" "TaxType" NOT NULL DEFAULT 'GST',
    "hsn_code" TEXT,
    "gst_rate" DECIMAL(5,2),
    "cess_rate" DECIMAL(5,2),
    "tax_inclusive" BOOLEAN NOT NULL DEFAULT false,
    "primary_unit" "UnitType" NOT NULL DEFAULT 'PIECE',
    "secondary_unit" "UnitType",
    "conversion_factor" DECIMAL(10,4),
    "min_order_qty" DECIMAL(10,2),
    "max_order_qty" DECIMAL(10,2),
    "weight" DECIMAL(10,3),
    "dimensions" JSONB,
    "packing_size" INTEGER,
    "packing_unit" "UnitType",
    "packing_description" TEXT,
    "barcode" TEXT,
    "batch_tracking" BOOLEAN NOT NULL DEFAULT false,
    "license_required" BOOLEAN NOT NULL DEFAULT false,
    "license_type" TEXT,
    "license_number" TEXT,
    "individual_sale" BOOLEAN NOT NULL DEFAULT true,
    "is_returnable" BOOLEAN NOT NULL DEFAULT true,
    "warranty_months" INTEGER,
    "shelf_life_days" INTEGER,
    "brand_id" TEXT,
    "manufacturer_id" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "config_json" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,
    "vertical_data" JSONB DEFAULT '{}',

    CONSTRAINT "gv_inv_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_product_prices" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "product_id" TEXT NOT NULL,
    "price_type" "PriceType" NOT NULL,
    "price_group_id" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "min_qty" DECIMAL(10,2),
    "max_qty" DECIMAL(10,2),
    "valid_from" TIMESTAMP(3),
    "valid_to" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_product_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_customer_price_groups" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discount" DECIMAL(5,2),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_customer_price_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_customer_group_mappings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "price_group_id" TEXT NOT NULL,
    "contact_id" TEXT,
    "organization_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_customer_group_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_product_tax_details" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "product_id" TEXT NOT NULL,
    "tax_name" TEXT NOT NULL,
    "tax_rate" DECIMAL(5,2) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_product_tax_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_product_unit_conversions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "product_id" TEXT NOT NULL,
    "from_unit" "UnitType" NOT NULL,
    "to_unit" "UnitType" NOT NULL,
    "conversion_rate" DECIMAL(10,4) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_product_unit_conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_product_relations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "from_product_id" TEXT NOT NULL,
    "to_product_id" TEXT NOT NULL,
    "relation_type" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_product_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_product_filters" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "product_id" TEXT NOT NULL,
    "lookup_value_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_product_filters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "product_id" TEXT NOT NULL,
    "inventory_type" "InventoryType" NOT NULL DEFAULT 'SIMPLE',
    "current_stock" INTEGER NOT NULL DEFAULT 0,
    "reserved_stock" INTEGER NOT NULL DEFAULT 0,
    "min_stock_level" INTEGER,
    "reorder_level" INTEGER,
    "max_stock_level" INTEGER,
    "avg_cost_price" DECIMAL(10,2),
    "last_purchase_price" DECIMAL(10,2),
    "selling_price" DECIMAL(10,2),
    "tax_type" "InventoryTaxType",
    "tax_rate" DECIMAL(5,2),
    "hsn_code" TEXT,
    "is_raw_material" BOOLEAN NOT NULL DEFAULT false,
    "is_finished_product" BOOLEAN NOT NULL DEFAULT false,
    "is_scrap" BOOLEAN NOT NULL DEFAULT false,
    "default_unit" TEXT,
    "purchase_unit_id" TEXT,
    "sale_unit_id" TEXT,
    "stock_unit_id" TEXT,
    "industry_code" TEXT,
    "default_location_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_stock_locations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'WAREHOUSE',
    "parent_location_id" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "contact_person" TEXT,
    "phone" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_stock_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_stock_transactions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "inventory_item_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "transaction_type" "StockTransactionType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2),
    "total_amount" DECIMAL(10,2),
    "location_id" TEXT NOT NULL,
    "to_location_id" TEXT,
    "serial_master_id" TEXT,
    "batch_id" TEXT,
    "bom_production_id" TEXT,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,
    "created_by_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_stock_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_stock_summaries" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "product_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "inventory_item_id" TEXT NOT NULL,
    "opening_balance" INTEGER NOT NULL DEFAULT 0,
    "total_in" INTEGER NOT NULL DEFAULT 0,
    "total_out" INTEGER NOT NULL DEFAULT 0,
    "current_stock" INTEGER NOT NULL DEFAULT 0,
    "reserved_stock" INTEGER NOT NULL DEFAULT 0,
    "avg_cost_price" DECIMAL(10,2),
    "last_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_stock_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_stock_adjustments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "product_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "adjustment_type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "status" "AdjustmentStatus" NOT NULL DEFAULT 'ADJ_PENDING',
    "created_by_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_stock_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_serial_masters" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "product_id" TEXT NOT NULL,
    "inventory_item_id" TEXT NOT NULL,
    "serial_no" TEXT NOT NULL,
    "code1" TEXT,
    "code2" TEXT,
    "batch_no" TEXT,
    "status" "SerialStatus" NOT NULL DEFAULT 'AVAILABLE',
    "expiry_type" "ExpiryType" NOT NULL DEFAULT 'NEVER',
    "expiry_value" INTEGER,
    "expiry_date" TIMESTAMP(3),
    "create_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activation_date" TIMESTAMP(3),
    "sold_date" TIMESTAMP(3),
    "mrp" DECIMAL(10,2),
    "purchase_rate" DECIMAL(10,2),
    "sale_rate" DECIMAL(10,2),
    "cost_price" DECIMAL(10,2),
    "tax_type" "InventoryTaxType",
    "tax_rate" DECIMAL(5,2),
    "hsn_code" TEXT,
    "location_id" TEXT,
    "customer_id" TEXT,
    "invoice_id" TEXT,
    "custom_fields" JSONB,
    "metadata" JSONB,
    "industry_code" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_serial_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_bom_formulas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "finished_product_id" TEXT NOT NULL,
    "formula_name" TEXT NOT NULL,
    "formula_code" TEXT NOT NULL,
    "yield_quantity" DECIMAL(10,3) NOT NULL DEFAULT 1,
    "yield_unit" TEXT NOT NULL DEFAULT 'piece',
    "prep_time" INTEGER,
    "cook_time" INTEGER,
    "instructions" TEXT,
    "industry_code" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_bom_formulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_bom_formula_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "formula_id" TEXT NOT NULL,
    "raw_material_id" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'gram',
    "wastage_percent" DECIMAL(5,2),
    "effective_quantity" DECIMAL(10,3),
    "is_critical" BOOLEAN NOT NULL DEFAULT true,
    "substitute_product_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_bom_formula_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_bom_productions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "formula_id" TEXT NOT NULL,
    "quantity_ordered" INTEGER NOT NULL,
    "quantity_produced" INTEGER NOT NULL DEFAULT 0,
    "scrap_quantity" INTEGER NOT NULL DEFAULT 0,
    "scrap_reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "production_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_date" TIMESTAMP(3),
    "created_by_id" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_bom_productions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_scrap_records" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "product_id" TEXT NOT NULL,
    "serial_master_id" TEXT,
    "batch_id" TEXT,
    "bom_production_id" TEXT,
    "scrap_type" "ScrapType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_cost" DECIMAL(10,2),
    "total_loss" DECIMAL(10,2),
    "reason" TEXT NOT NULL,
    "location_id" TEXT,
    "is_raw_material" BOOLEAN NOT NULL DEFAULT false,
    "is_finished_product" BOOLEAN NOT NULL DEFAULT false,
    "disposal_method" TEXT,
    "created_by_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_scrap_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_labels" (
    "id" TEXT NOT NULL,
    "industry_code" TEXT NOT NULL,
    "serial_no_label" TEXT NOT NULL DEFAULT 'Serial No',
    "code1_label" TEXT,
    "code2_label" TEXT,
    "expiry_label" TEXT,
    "stock_in_label" TEXT,
    "stock_out_label" TEXT,
    "location_label" TEXT,

    CONSTRAINT "gv_inv_labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_unit_masters" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "unit_category" "UnitCategory" NOT NULL,
    "is_base" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_unit_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_unit_conversions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "from_unit_id" TEXT NOT NULL,
    "to_unit_id" TEXT NOT NULL,
    "conversion_factor" DECIMAL(15,6) NOT NULL,
    "product_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_unit_conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_purchase_rfqs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "rfq_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "required_by_date" TIMESTAMP(3),
    "valid_until_date" TIMESTAMP(3),
    "sent_to_vendor_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "workflow_instance_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "approved_by_id" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_purchase_rfqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_purchase_rfq_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "rfq_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit_id" TEXT NOT NULL,
    "specifications" TEXT,
    "remarks" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_purchase_rfq_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_purchase_quotations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "rfq_id" TEXT,
    "vendor_id" TEXT NOT NULL,
    "quotation_number" TEXT NOT NULL,
    "quotation_date" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "credit_days" INTEGER,
    "delivery_days" INTEGER,
    "payment_terms" TEXT,
    "delivery_terms" TEXT,
    "subtotal" DECIMAL(12,2),
    "tax_amount" DECIMAL(12,2),
    "grand_total" DECIMAL(12,2),
    "compare_score" DECIMAL(5,2),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_purchase_quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_purchase_quotation_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "quotation_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit_id" TEXT NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2),
    "tax_rate" DECIMAL(5,2),
    "tax_amount" DECIMAL(10,2),
    "total_amount" DECIMAL(12,2) NOT NULL,
    "delivery_date" TIMESTAMP(3),
    "remarks" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_purchase_quotation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_quotation_comparisons" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "rfq_id" TEXT NOT NULL,
    "compare_by" TEXT NOT NULL,
    "custom_weights" JSONB,
    "comparison_data" JSONB NOT NULL,
    "selected_quotation_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "created_by_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_quotation_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_purchase_orders" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "po_number" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "quotation_id" TEXT,
    "rfq_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "order_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expected_delivery_date" TIMESTAMP(3),
    "delivery_location_id" TEXT,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "discount_amount" DECIMAL(12,2),
    "tax_amount" DECIMAL(12,2) NOT NULL,
    "grand_total" DECIMAL(12,2) NOT NULL,
    "credit_days" INTEGER,
    "payment_terms" TEXT,
    "completion_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "workflow_instance_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,
    "vertical_data" JSONB DEFAULT '{}',

    CONSTRAINT "gv_inv_purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_purchase_order_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "po_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "ordered_qty" DECIMAL(10,3) NOT NULL,
    "received_qty" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "pending_qty" DECIMAL(10,3) NOT NULL,
    "rejected_qty" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "unit_id" TEXT NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2),
    "tax_rate" DECIMAL(5,2),
    "tax_type" TEXT,
    "tax_amount" DECIMAL(10,2),
    "hsn_code" TEXT,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_goods_receipts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "receipt_type" TEXT NOT NULL,
    "receipt_number" TEXT NOT NULL,
    "vendor_id" TEXT,
    "po_id" TEXT,
    "location_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "receipt_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vendor_challan_no" TEXT,
    "inspected_by_id" TEXT,
    "inspected_date" TIMESTAMP(3),
    "total_amount" DECIMAL(12,2),
    "inventory_updated" BOOLEAN NOT NULL DEFAULT false,
    "workflow_instance_id" TEXT,
    "remarks" TEXT,
    "created_by_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_goods_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_goods_receipt_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "receipt_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "po_item_id" TEXT,
    "received_qty" DECIMAL(10,3) NOT NULL,
    "accepted_qty" DECIMAL(10,3),
    "rejected_qty" DECIMAL(10,3),
    "unit_id" TEXT NOT NULL,
    "unit_price" DECIMAL(10,2),
    "batch_no" TEXT,
    "serial_nos" JSONB,
    "expiry_date" TIMESTAMP(3),
    "location_id" TEXT,
    "rejection_reason" TEXT,
    "inspection_notes" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_goods_receipt_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_inv_purchase_masters" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "local_ledger_id" TEXT,
    "central_ledger_id" TEXT,
    "igst_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "cgst_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "sgst_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "cess_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "nature_of_transaction" TEXT NOT NULL DEFAULT 'PURCHASE',
    "taxability" TEXT NOT NULL DEFAULT 'TAXABLE',
    "igst_ledger_id" TEXT,
    "cgst_ledger_id" TEXT,
    "sgst_ledger_id" TEXT,
    "cess_ledger_id" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_inv_purchase_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_not_reminders" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "channel" "ReminderChannel" NOT NULL DEFAULT 'IN_APP',
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "sent_at" TIMESTAMP(3),
    "is_sent" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "description" TEXT,
    "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "type" "ReminderType" NOT NULL DEFAULT 'PERSONAL',
    "recurrence_config" JSONB,
    "snoozed_until" TIMESTAMP(3),
    "snooze_count" INTEGER NOT NULL DEFAULT 0,
    "max_snooze" INTEGER NOT NULL DEFAULT 3,
    "triggered_at" TIMESTAMP(3),
    "acknowledged_at" TIMESTAMP(3),
    "missed_at" TIMESTAMP(3),
    "task_id" TEXT,
    "notify_via" JSONB NOT NULL DEFAULT '["PUSH","IN_APP"]',
    "recipient_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_not_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_not_notifications" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "category" "NotificationCategory" NOT NULL,
    "event_type" "NotificationEventType",
    "title" VARCHAR(500) NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "metadata" JSONB,
    "action_url" TEXT,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "entity_type" TEXT,
    "entity_id" TEXT,
    "recipient_id" TEXT NOT NULL,
    "sender_id" TEXT,
    "group_key" TEXT,
    "is_grouped" BOOLEAN NOT NULL DEFAULT false,
    "group_count" INTEGER NOT NULL DEFAULT 1,
    "sent_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "dismissed_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "external_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_not_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_not_preferences" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "user_id" TEXT NOT NULL,
    "channels" JSONB NOT NULL DEFAULT '{}',
    "categories" JSONB NOT NULL DEFAULT '{}',
    "quiet_hours_start" TEXT,
    "quiet_hours_end" TEXT,
    "digest_frequency" "DigestFrequency" NOT NULL DEFAULT 'REALTIME',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_not_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_not_templates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "code" VARCHAR(100),
    "category" "NotificationCategory" NOT NULL,
    "channel" "NotificationChannel",
    "subject" VARCHAR(500),
    "body" TEXT NOT NULL,
    "body_html" TEXT,
    "channels" JSONB NOT NULL DEFAULT '[]',
    "variables" JSONB NOT NULL DEFAULT '[]',
    "available_variables" JSONB,
    "industry_code" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_not_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_not_push_subscriptions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "user_id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT,
    "auth" TEXT,
    "device_type" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_not_push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_not_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "event_code" TEXT NOT NULL DEFAULT '',
    "event_name" TEXT,
    "event_type" "NotificationEventType",
    "event_category" "NotificationEventCategory",
    "event_label" TEXT,
    "channels" JSONB NOT NULL DEFAULT '[]',
    "enable_email" BOOLEAN NOT NULL DEFAULT false,
    "enable_whatsapp" BOOLEAN NOT NULL DEFAULT false,
    "enable_push" BOOLEAN NOT NULL DEFAULT false,
    "enable_in_app_alert" BOOLEAN NOT NULL DEFAULT true,
    "enable_call" BOOLEAN NOT NULL DEFAULT false,
    "enable_sms" BOOLEAN NOT NULL DEFAULT false,
    "notify_assignee" BOOLEAN NOT NULL DEFAULT true,
    "notify_creator" BOOLEAN NOT NULL DEFAULT false,
    "notify_manager" BOOLEAN NOT NULL DEFAULT false,
    "notify_admin" BOOLEAN NOT NULL DEFAULT false,
    "notify_watchers" BOOLEAN NOT NULL DEFAULT true,
    "notify_department" BOOLEAN NOT NULL DEFAULT false,
    "custom_recipient_ids" JSONB,
    "template_id" TEXT,
    "email_template_id" TEXT,
    "whatsapp_template_id" TEXT,
    "email_subject" TEXT,
    "custom_message" TEXT,
    "push_title" TEXT,
    "push_body" TEXT,
    "sms_template" TEXT,
    "respect_quiet_hours" BOOLEAN NOT NULL DEFAULT true,
    "is_realtime" BOOLEAN NOT NULL DEFAULT true,
    "delay_minutes" INTEGER NOT NULL DEFAULT 0,
    "digest_enabled" BOOLEAN NOT NULL DEFAULT false,
    "digest_interval_mins" INTEGER,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_not_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_not_escalation_rules" (
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
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_not_escalation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_pay_payments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "payment_no" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" "PaymentMethod" NOT NULL,
    "gateway" "PaymentGateway" NOT NULL DEFAULT 'MANUAL',
    "gateway_order_id" TEXT,
    "gateway_payment_id" TEXT,
    "gateway_signature" TEXT,
    "gateway_response" JSONB,
    "cheque_number" TEXT,
    "cheque_date" TIMESTAMP(3),
    "cheque_bank_name" TEXT,
    "transaction_ref" TEXT,
    "upi_transaction_id" TEXT,
    "paid_at" TIMESTAMP(3),
    "notes" TEXT,
    "failure_reason" TEXT,
    "recorded_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_pay_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_pay_payment_receipts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "receipt_no" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "amount_in_words" TEXT,
    "received_from" TEXT NOT NULL,
    "paid_for" TEXT NOT NULL,
    "payment_method" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "generated_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_pay_payment_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_pay_refunds" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "refund_no" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'REFUND_PENDING',
    "gateway_refund_id" TEXT,
    "gateway_response" JSONB,
    "processed_at" TIMESTAMP(3),
    "processed_by_id" TEXT,
    "failure_reason" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_pay_refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_pay_payment_reminders" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "invoice_id" TEXT NOT NULL,
    "level" "ReminderLevel" NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "sent_at" TIMESTAMP(3),
    "channel" TEXT NOT NULL DEFAULT 'EMAIL',
    "is_sent" BOOLEAN NOT NULL DEFAULT false,
    "response_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_pay_payment_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_pay_records" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "payment_number" TEXT NOT NULL,
    "payment_type" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "entity_name" TEXT,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "payment_mode" TEXT NOT NULL,
    "bank_account_id" TEXT,
    "cheque_number" TEXT,
    "cheque_date" TIMESTAMP(3),
    "transaction_ref" TEXT,
    "upi_id" TEXT,
    "tds_applicable" BOOLEAN NOT NULL DEFAULT false,
    "tds_rate" DECIMAL(5,2),
    "tds_amount" DECIMAL(10,2),
    "tds_section" TEXT,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "narration" TEXT,
    "workflow_instance_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "approved_by_id" TEXT,
    "account_transaction_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_pay_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_rpt_export_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "report_type" "ReportType" NOT NULL,
    "format" "ReportFormat" NOT NULL,
    "filters" JSONB,
    "record_count" INTEGER NOT NULL,
    "file_url" TEXT,
    "file_size" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "error_message" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "exported_by_id" TEXT NOT NULL,
    "exported_by_name" TEXT NOT NULL,
    "report_code" TEXT,
    "report_name" TEXT,
    "export_source" TEXT DEFAULT 'MANUAL',
    "scheduled_report_id" TEXT,
    "generation_time_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_rpt_export_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_rpt_definitions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "ReportCategory" NOT NULL,
    "default_filters" JSONB,
    "available_filters" JSONB,
    "available_formats" TEXT[],
    "supports_drill_down" BOOLEAN NOT NULL DEFAULT false,
    "supports_period_comparison" BOOLEAN NOT NULL DEFAULT false,
    "required_role" TEXT,
    "required_feature" TEXT,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "last_generated_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_rpt_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_rpt_bookmarks" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "report_def_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filters" JSONB,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_rpt_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_rpt_scheduled_reports" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "report_def_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filters" JSONB,
    "format" "ReportFormat" NOT NULL DEFAULT 'PDF',
    "frequency" "ReportFrequency" NOT NULL,
    "day_of_week" INTEGER,
    "day_of_month" INTEGER,
    "time_of_day" TEXT NOT NULL DEFAULT '08:00',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "recipient_emails" TEXT[],
    "recipient_user_ids" TEXT[],
    "status" "ScheduledReportStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_sent_at" TIMESTAMP(3),
    "next_scheduled_at" TIMESTAMP(3),
    "last_error" TEXT,
    "send_count" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_rpt_scheduled_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_rpt_templates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "report_def_id" TEXT,
    "layout" JSONB NOT NULL,
    "data_source" JSONB,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "industry_code" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_rpt_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_sal_quotations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "quotation_no" TEXT NOT NULL,
    "status" "QuotationStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT,
    "summary" TEXT,
    "cover_note" TEXT,
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discount_type" TEXT,
    "discount_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxable_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cgst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sgst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "igst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cess_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_tax" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "round_off" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "price_type" "QuotationPriceType" NOT NULL DEFAULT 'FIXED',
    "min_amount" DECIMAL(14,2),
    "max_amount" DECIMAL(14,2),
    "plus_minus_percent" DECIMAL(5,2),
    "valid_from" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),
    "payment_terms" TEXT,
    "delivery_terms" TEXT,
    "warranty_terms" TEXT,
    "terms_conditions" TEXT,
    "lead_id" TEXT NOT NULL,
    "contact_person_id" TEXT,
    "organization_id" TEXT,
    "parent_quotation_id" TEXT,
    "accepted_at" TIMESTAMP(3),
    "accepted_note" TEXT,
    "rejected_at" TIMESTAMP(3),
    "rejected_reason" TEXT,
    "ai_score" INTEGER,
    "ai_suggestions" JSONB,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "config_json" JSONB,
    "internal_notes" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_sal_quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_sal_quotation_line_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "quotation_id" TEXT NOT NULL,
    "product_id" TEXT,
    "product_code" TEXT,
    "product_name" TEXT NOT NULL,
    "description" TEXT,
    "hsn_code" TEXT,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" TEXT,
    "unit_price" DECIMAL(14,2) NOT NULL,
    "mrp" DECIMAL(14,2),
    "discount_type" TEXT,
    "discount_value" DECIMAL(14,2),
    "discount_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "line_total" DECIMAL(14,2) NOT NULL,
    "gst_rate" DECIMAL(5,2),
    "cgst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sgst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "igst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cess_rate" DECIMAL(5,2),
    "cess_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_with_tax" DECIMAL(14,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "is_optional" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_sal_quotation_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_sal_quotation_send_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "quotation_id" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL,
    "sent_by_id" TEXT NOT NULL,
    "sent_by_name" TEXT NOT NULL,
    "channel" "QuotationSendChannel" NOT NULL,
    "receiver_contact_id" TEXT,
    "receiver_name" TEXT,
    "receiver_email" TEXT,
    "receiver_phone" TEXT,
    "organization_id" TEXT,
    "organization_name" TEXT,
    "viewed_at" TIMESTAMP(3),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "downloaded_at" TIMESTAMP(3),
    "quotation_value" DECIMAL(14,2) NOT NULL,
    "price_type" "QuotationPriceType" NOT NULL,
    "min_value" DECIMAL(14,2),
    "max_value" DECIMAL(14,2),
    "plus_minus_percent" DECIMAL(5,2),
    "message" TEXT,
    "pdf_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_sal_quotation_send_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_sal_quotation_negotiation_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "quotation_id" TEXT NOT NULL,
    "negotiation_type" "NegotiationType" NOT NULL,
    "customer_requirement" TEXT,
    "customer_budget" DECIMAL(14,2),
    "customer_price_expected" DECIMAL(14,2),
    "our_price" DECIMAL(14,2),
    "proposed_discount" DECIMAL(5,2),
    "counter_offer_amount" DECIMAL(14,2),
    "items_added" JSONB,
    "items_removed" JSONB,
    "items_modified" JSONB,
    "terms_changed" TEXT,
    "note" TEXT,
    "outcome" TEXT,
    "logged_by_id" TEXT NOT NULL,
    "logged_by_name" TEXT NOT NULL,
    "contact_person_id" TEXT,
    "contact_person_name" TEXT,
    "logged_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_sal_quotation_negotiation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_sal_quotation_activities" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "quotation_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "previous_value" TEXT,
    "new_value" TEXT,
    "changed_field" TEXT,
    "performed_by_id" TEXT NOT NULL,
    "performed_by_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_sal_quotation_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_sal_quotation_templates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "industry" TEXT,
    "default_items" JSONB,
    "default_terms" TEXT,
    "default_payment" TEXT,
    "default_delivery" TEXT,
    "default_warranty" TEXT,
    "cover_note" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "win_rate" DECIMAL(5,2),
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_sal_quotation_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_sal_targets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "user_id" TEXT,
    "role_id" TEXT,
    "metric" "TargetMetric" NOT NULL,
    "target_value" DECIMAL(14,2) NOT NULL,
    "period" "TargetPeriod" NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "current_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "achieved_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "last_calculated_at" TIMESTAMP(3),
    "name" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_sal_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_sal_service_rates" (
    "id" TEXT NOT NULL,
    "service_key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "base_tokens" INTEGER NOT NULL,
    "margin_pct" INTEGER NOT NULL DEFAULT 20,
    "final_tokens" INTEGER NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_sal_service_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_sal_orders" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "quotation_id" TEXT,
    "customer_id" TEXT NOT NULL,
    "customer_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "order_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expected_delivery_date" TIMESTAMP(3),
    "delivery_location_id" TEXT,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "discount_amount" DECIMAL(12,2),
    "taxable_amount" DECIMAL(12,2) NOT NULL,
    "cgst_amount" DECIMAL(12,2),
    "sgst_amount" DECIMAL(12,2),
    "igst_amount" DECIMAL(12,2),
    "cess_amount" DECIMAL(12,2),
    "round_off" DECIMAL(10,2),
    "grand_total" DECIMAL(12,2) NOT NULL,
    "completion_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "credit_days" INTEGER,
    "payment_terms" TEXT,
    "workflow_instance_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,
    "vertical_data" JSONB DEFAULT '{}',

    CONSTRAINT "gv_sal_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_sal_order_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "sale_order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "ordered_qty" DECIMAL(10,3) NOT NULL,
    "delivered_qty" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "pending_qty" DECIMAL(10,3) NOT NULL,
    "returned_qty" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "unit_id" TEXT NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2),
    "tax_rate" DECIMAL(5,2),
    "tax_type" TEXT,
    "tax_amount" DECIMAL(10,2),
    "hsn_code" TEXT,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_sal_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_sal_delivery_challans" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "challan_number" TEXT NOT NULL,
    "sale_order_id" TEXT,
    "customer_id" TEXT NOT NULL,
    "customer_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "dispatch_date" TIMESTAMP(3),
    "delivery_date" TIMESTAMP(3),
    "from_location_id" TEXT NOT NULL,
    "transporter_name" TEXT,
    "vehicle_number" TEXT,
    "lr_number" TEXT,
    "eway_bill_number" TEXT,
    "eway_bill_date" TIMESTAMP(3),
    "total_amount" DECIMAL(12,2),
    "inventory_updated" BOOLEAN NOT NULL DEFAULT false,
    "workflow_instance_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_sal_delivery_challans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_sal_delivery_challan_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "challan_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "sale_order_item_id" TEXT,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit_id" TEXT NOT NULL,
    "unit_price" DECIMAL(10,2),
    "batch_no" TEXT,
    "serial_nos" JSONB,
    "expiry_date" TIMESTAMP(3),
    "from_location_id" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_sal_delivery_challan_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_sal_returns" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "return_number" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "customer_type" TEXT NOT NULL,
    "sale_order_id" TEXT,
    "invoice_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "return_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "return_reason" TEXT NOT NULL,
    "receive_location_id" TEXT,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "tax_amount" DECIMAL(12,2),
    "grand_total" DECIMAL(12,2) NOT NULL,
    "inventory_updated" BOOLEAN NOT NULL DEFAULT false,
    "credit_note_id" TEXT,
    "workflow_instance_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_sal_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_sal_return_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "return_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "returned_qty" DECIMAL(10,3) NOT NULL,
    "accepted_qty" DECIMAL(10,3),
    "rejected_qty" DECIMAL(10,3),
    "unit_id" TEXT NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "tax_rate" DECIMAL(5,2),
    "tax_amount" DECIMAL(10,2),
    "total_amount" DECIMAL(12,2) NOT NULL,
    "hsn_code" TEXT,
    "return_reason" TEXT,
    "condition" TEXT,
    "batch_no" TEXT,
    "serial_nos" JSONB,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_sal_return_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_sal_masters" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "local_ledger_id" TEXT,
    "central_ledger_id" TEXT,
    "igst_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "cgst_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "sgst_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "cess_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "nature_of_transaction" TEXT NOT NULL DEFAULT 'SALES',
    "taxability" TEXT NOT NULL DEFAULT 'TAXABLE',
    "igst_ledger_id" TEXT,
    "cgst_ledger_id" TEXT,
    "sgst_ledger_id" TEXT,
    "cess_ledger_id" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_sal_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_sal_price_lists" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "valid_from" TIMESTAMP(3),
    "valid_to" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_sal_price_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_sal_price_list_items" (
    "id" TEXT NOT NULL,
    "price_list_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "selling_price" DECIMAL(14,2) NOT NULL,
    "min_quantity" INTEGER NOT NULL DEFAULT 1,
    "max_quantity" INTEGER,
    "margin_percent" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gv_sal_price_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_tax_gst_verification_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "gst_number" TEXT NOT NULL,
    "verification_method" TEXT NOT NULL,
    "api_response" JSONB,
    "is_valid" BOOLEAN NOT NULL,
    "business_name" TEXT,
    "business_address" TEXT,
    "gst_status" TEXT,
    "approved_by" TEXT,
    "approval_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_tax_gst_verification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_tax_gst_returns" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "return_type" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "financial_year" TEXT NOT NULL,
    "b2b_invoices" JSONB,
    "b2c_large" JSONB,
    "b2c_small" JSONB,
    "credit_debit_notes" JSONB,
    "hsn_summary" JSONB,
    "total_taxable_value" DECIMAL(12,2),
    "total_cgst" DECIMAL(12,2),
    "total_sgst" DECIMAL(12,2),
    "total_igst" DECIMAL(12,2),
    "total_cess" DECIMAL(12,2),
    "input_tax_credit" JSONB,
    "net_tax_payable" DECIMAL(12,2),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "filed_at" TIMESTAMP(3),
    "filed_by_id" TEXT,
    "acknowledgement_no" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_tax_gst_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_tax_tds_records" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "section_name" TEXT,
    "deductee_id" TEXT NOT NULL,
    "deductee_name" TEXT NOT NULL,
    "deductee_pan" TEXT,
    "payment_record_id" TEXT,
    "invoice_id" TEXT,
    "gross_amount" DECIMAL(12,2) NOT NULL,
    "tds_rate" DECIMAL(5,2) NOT NULL,
    "tds_amount" DECIMAL(10,2) NOT NULL,
    "net_amount" DECIMAL(12,2) NOT NULL,
    "deduction_date" TIMESTAMP(3) NOT NULL,
    "deposit_date" TIMESTAMP(3),
    "challan_number" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DEDUCTED',
    "quarter" TEXT,
    "financial_year" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_tax_tds_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_wf_approval_requests" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "action" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "maker_id" TEXT NOT NULL,
    "checker_id" TEXT,
    "checker_role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "maker_note" TEXT,
    "checker_note" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "decided_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_wf_approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_wf_approval_rules" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "entity_type" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "checker_role" TEXT NOT NULL,
    "min_checkers" INTEGER NOT NULL DEFAULT 1,
    "skip_for_roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "amount_field" TEXT,
    "amount_threshold" DOUBLE PRECISION,
    "expiry_hours" INTEGER NOT NULL DEFAULT 48,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_wf_approval_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_wf_workflows" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "config_json" JSONB,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_wf_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_wf_states" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "workflow_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "state_type" "WorkflowStateType" NOT NULL,
    "category" "WorkflowStateCategory",
    "color" TEXT,
    "icon" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_wf_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_wf_transitions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "workflow_id" TEXT NOT NULL,
    "from_state_id" TEXT NOT NULL,
    "to_state_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "trigger_type" "WorkflowTriggerType" NOT NULL DEFAULT 'MANUAL',
    "conditions" JSONB,
    "actions" JSONB,
    "required_permission" TEXT,
    "required_role" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_wf_transitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_wf_instances" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "workflow_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "current_state_id" TEXT NOT NULL,
    "previous_state_id" TEXT,
    "data" JSONB,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_wf_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_wf_history" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "instance_id" TEXT NOT NULL,
    "from_state_id" TEXT,
    "to_state_id" TEXT NOT NULL,
    "transition_id" TEXT,
    "action" TEXT NOT NULL,
    "performed_by_id" TEXT NOT NULL,
    "performed_by_name" TEXT NOT NULL,
    "comment" TEXT,
    "metadata" JSONB,
    "duration" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_wf_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_wf_approvals" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "instance_id" TEXT NOT NULL,
    "transition_id" TEXT NOT NULL,
    "requested_by_id" TEXT NOT NULL,
    "approved_by_id" TEXT,
    "status" "WorkflowApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "expires_at" TIMESTAMP(3),
    "decided_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_wf_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_wf_action_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "instance_id" TEXT NOT NULL,
    "transition_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "action_config" JSONB,
    "result" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,
    "executed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_wf_action_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gv_wf_sla_escalations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "instance_id" TEXT NOT NULL,
    "state_id" TEXT NOT NULL,
    "sla_hours" INTEGER NOT NULL,
    "escalated_to_id" TEXT,
    "escalation_level" INTEGER NOT NULL DEFAULT 1,
    "escalated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,

    CONSTRAINT "gv_wf_sla_escalations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gv_acc_invoices_tenant_id_status_idx" ON "gv_acc_invoices"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "gv_acc_invoices_tenant_id_contact_id_idx" ON "gv_acc_invoices"("tenant_id", "contact_id");

-- CreateIndex
CREATE INDEX "gv_acc_invoices_tenant_id_organization_id_idx" ON "gv_acc_invoices"("tenant_id", "organization_id");

-- CreateIndex
CREATE INDEX "gv_acc_invoices_tenant_id_due_date_idx" ON "gv_acc_invoices"("tenant_id", "due_date");

-- CreateIndex
CREATE INDEX "gv_acc_invoices_quotation_id_idx" ON "gv_acc_invoices"("quotation_id");

-- CreateIndex
CREATE INDEX "gv_acc_invoices_lead_id_idx" ON "gv_acc_invoices"("lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_acc_invoices_tenant_id_invoice_no_key" ON "gv_acc_invoices"("tenant_id", "invoice_no");

-- CreateIndex
CREATE INDEX "gv_acc_invoice_line_items_is_deleted_idx" ON "gv_acc_invoice_line_items"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_acc_invoice_line_items_invoice_id_idx" ON "gv_acc_invoice_line_items"("invoice_id");

-- CreateIndex
CREATE INDEX "gv_acc_invoice_line_items_tenant_id_idx" ON "gv_acc_invoice_line_items"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_acc_proforma_invoices_invoice_id_key" ON "gv_acc_proforma_invoices"("invoice_id");

-- CreateIndex
CREATE INDEX "gv_acc_proforma_invoices_tenant_id_status_idx" ON "gv_acc_proforma_invoices"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "gv_acc_proforma_invoices_tenant_id_quotation_id_idx" ON "gv_acc_proforma_invoices"("tenant_id", "quotation_id");

-- CreateIndex
CREATE INDEX "gv_acc_proforma_invoices_tenant_id_lead_id_idx" ON "gv_acc_proforma_invoices"("tenant_id", "lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_acc_proforma_invoices_tenant_id_proforma_no_key" ON "gv_acc_proforma_invoices"("tenant_id", "proforma_no");

-- CreateIndex
CREATE INDEX "gv_acc_proforma_line_items_is_deleted_idx" ON "gv_acc_proforma_line_items"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_acc_proforma_line_items_proforma_invoice_id_idx" ON "gv_acc_proforma_line_items"("proforma_invoice_id");

-- CreateIndex
CREATE INDEX "gv_acc_proforma_line_items_tenant_id_idx" ON "gv_acc_proforma_line_items"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_acc_credit_notes_tenant_id_invoice_id_idx" ON "gv_acc_credit_notes"("tenant_id", "invoice_id");

-- CreateIndex
CREATE INDEX "gv_acc_credit_notes_tenant_id_status_idx" ON "gv_acc_credit_notes"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "gv_acc_credit_notes_tenant_id_credit_note_no_key" ON "gv_acc_credit_notes"("tenant_id", "credit_note_no");

-- CreateIndex
CREATE INDEX "gv_acc_saved_formulas_is_deleted_idx" ON "gv_acc_saved_formulas"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_acc_saved_formulas_category_idx" ON "gv_acc_saved_formulas"("category");

-- CreateIndex
CREATE INDEX "gv_acc_saved_formulas_tenant_id_idx" ON "gv_acc_saved_formulas"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_acc_saved_formulas_name_tenant_id_key" ON "gv_acc_saved_formulas"("name", "tenant_id");

-- CreateIndex
CREATE INDEX "gv_acc_purchase_invoices_tenant_id_idx" ON "gv_acc_purchase_invoices"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_acc_purchase_invoices_tenant_id_status_idx" ON "gv_acc_purchase_invoices"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "gv_acc_purchase_invoices_tenant_id_our_reference_key" ON "gv_acc_purchase_invoices"("tenant_id", "our_reference");

-- CreateIndex
CREATE INDEX "gv_acc_purchase_invoice_items_is_deleted_idx" ON "gv_acc_purchase_invoice_items"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_acc_purchase_invoice_items_tenant_id_idx" ON "gv_acc_purchase_invoice_items"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_acc_purchase_invoice_items_invoice_id_idx" ON "gv_acc_purchase_invoice_items"("invoice_id");

-- CreateIndex
CREATE INDEX "gv_acc_ledger_masters_is_deleted_idx" ON "gv_acc_ledger_masters"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_acc_ledger_masters_tenant_id_idx" ON "gv_acc_ledger_masters"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_acc_ledger_masters_tenant_id_code_key" ON "gv_acc_ledger_masters"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "gv_acc_ledger_mappings_is_deleted_idx" ON "gv_acc_ledger_mappings"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_acc_ledger_mappings_tenant_id_ledger_id_idx" ON "gv_acc_ledger_mappings"("tenant_id", "ledger_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_acc_ledger_mappings_tenant_id_entity_type_entity_id_key" ON "gv_acc_ledger_mappings"("tenant_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "gv_acc_transactions_tenant_id_transaction_date_idx" ON "gv_acc_transactions"("tenant_id", "transaction_date");

-- CreateIndex
CREATE INDEX "gv_acc_bank_accounts_tenant_id_idx" ON "gv_acc_bank_accounts"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_acc_bank_accounts_tenant_id_account_number_key" ON "gv_acc_bank_accounts"("tenant_id", "account_number");

-- CreateIndex
CREATE INDEX "gv_acc_bank_reconciliations_is_deleted_idx" ON "gv_acc_bank_reconciliations"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_acc_bank_reconciliations_tenant_id_idx" ON "gv_acc_bank_reconciliations"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_acc_bank_reconciliations_tenant_id_status_idx" ON "gv_acc_bank_reconciliations"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "gv_acc_debit_notes_tenant_id_idx" ON "gv_acc_debit_notes"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_acc_debit_notes_tenant_id_status_idx" ON "gv_acc_debit_notes"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "gv_acc_debit_notes_tenant_id_debit_note_number_key" ON "gv_acc_debit_notes"("tenant_id", "debit_note_number");

-- CreateIndex
CREATE INDEX "gv_acc_debit_note_items_is_deleted_idx" ON "gv_acc_debit_note_items"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_acc_debit_note_items_tenant_id_idx" ON "gv_acc_debit_note_items"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_acc_debit_note_items_debit_note_id_idx" ON "gv_acc_debit_note_items"("debit_note_id");

-- CreateIndex
CREATE INDEX "gv_acc_account_groups_tenant_id_idx" ON "gv_acc_account_groups"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_acc_account_groups_tenant_id_code_key" ON "gv_acc_account_groups"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "gv_aud_sync_change_logs_is_deleted_idx" ON "gv_aud_sync_change_logs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_aud_sync_change_logs_user_id_device_id_is_pushed_idx" ON "gv_aud_sync_change_logs"("user_id", "device_id", "is_pushed");

-- CreateIndex
CREATE INDEX "gv_aud_sync_change_logs_entity_name_entity_id_idx" ON "gv_aud_sync_change_logs"("entity_name", "entity_id");

-- CreateIndex
CREATE INDEX "gv_aud_sync_change_logs_tenant_id_idx" ON "gv_aud_sync_change_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_aud_sync_audit_logs_is_deleted_idx" ON "gv_aud_sync_audit_logs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_aud_sync_audit_logs_user_id_created_at_idx" ON "gv_aud_sync_audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "gv_aud_sync_audit_logs_action_created_at_idx" ON "gv_aud_sync_audit_logs"("action", "created_at");

-- CreateIndex
CREATE INDEX "gv_aud_sync_audit_logs_tenant_id_idx" ON "gv_aud_sync_audit_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_aud_cron_job_run_logs_is_deleted_idx" ON "gv_aud_cron_job_run_logs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_aud_cron_job_run_logs_job_code_created_at_idx" ON "gv_aud_cron_job_run_logs"("job_code", "created_at");

-- CreateIndex
CREATE INDEX "gv_aud_cron_job_run_logs_status_created_at_idx" ON "gv_aud_cron_job_run_logs"("status", "created_at");

-- CreateIndex
CREATE INDEX "gv_aud_cron_job_run_logs_tenant_id_idx" ON "gv_aud_cron_job_run_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_aud_api_request_logs_is_deleted_idx" ON "gv_aud_api_request_logs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_aud_api_request_logs_tenant_id_api_key_id_created_at_idx" ON "gv_aud_api_request_logs"("tenant_id", "api_key_id", "created_at");

-- CreateIndex
CREATE INDEX "gv_aud_api_request_logs_tenant_id_path_created_at_idx" ON "gv_aud_api_request_logs"("tenant_id", "path", "created_at");

-- CreateIndex
CREATE INDEX "gv_aud_api_request_logs_tenant_id_status_code_created_at_idx" ON "gv_aud_api_request_logs"("tenant_id", "status_code", "created_at");

-- CreateIndex
CREATE INDEX "gv_aud_unmask_logs_is_deleted_idx" ON "gv_aud_unmask_logs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_aud_unmask_logs_tenant_id_user_id_idx" ON "gv_aud_unmask_logs"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "gv_aud_ai_usage_logs_is_deleted_idx" ON "gv_aud_ai_usage_logs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_aud_ai_usage_logs_tenant_id_provider_idx" ON "gv_aud_ai_usage_logs"("tenant_id", "provider");

-- CreateIndex
CREATE INDEX "gv_aud_ai_usage_logs_user_id_idx" ON "gv_aud_ai_usage_logs"("user_id");

-- CreateIndex
CREATE INDEX "gv_aud_control_room_logs_is_deleted_idx" ON "gv_aud_control_room_logs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_aud_control_room_logs_tenant_id_created_at_idx" ON "gv_aud_control_room_logs"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "gv_aud_control_room_logs_rule_code_tenant_id_idx" ON "gv_aud_control_room_logs"("rule_code", "tenant_id");

-- CreateIndex
CREATE INDEX "gv_aud_control_room_logs_batch_id_idx" ON "gv_aud_control_room_logs"("batch_id");

-- CreateIndex
CREATE INDEX "gv_cmn_email_accounts_is_deleted_idx" ON "gv_cmn_email_accounts"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cmn_email_accounts_user_id_status_idx" ON "gv_cmn_email_accounts"("user_id", "status");

-- CreateIndex
CREATE INDEX "gv_cmn_email_accounts_tenant_id_idx" ON "gv_cmn_email_accounts"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cmn_email_accounts_tenant_id_user_id_email_address_key" ON "gv_cmn_email_accounts"("tenant_id", "user_id", "email_address");

-- CreateIndex
CREATE INDEX "gv_cmn_email_threads_is_deleted_idx" ON "gv_cmn_email_threads"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cmn_email_threads_linked_entity_type_linked_entity_id_idx" ON "gv_cmn_email_threads"("linked_entity_type", "linked_entity_id");

-- CreateIndex
CREATE INDEX "gv_cmn_email_threads_last_message_at_idx" ON "gv_cmn_email_threads"("last_message_at");

-- CreateIndex
CREATE INDEX "gv_cmn_email_threads_tenant_id_idx" ON "gv_cmn_email_threads"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cmn_emails_is_deleted_idx" ON "gv_cmn_emails"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cmn_emails_account_id_direction_created_at_idx" ON "gv_cmn_emails"("account_id", "direction", "created_at");

-- CreateIndex
CREATE INDEX "gv_cmn_emails_thread_id_idx" ON "gv_cmn_emails"("thread_id");

-- CreateIndex
CREATE INDEX "gv_cmn_emails_linked_entity_type_linked_entity_id_idx" ON "gv_cmn_emails"("linked_entity_type", "linked_entity_id");

-- CreateIndex
CREATE INDEX "gv_cmn_emails_campaign_id_idx" ON "gv_cmn_emails"("campaign_id");

-- CreateIndex
CREATE INDEX "gv_cmn_emails_status_scheduled_at_idx" ON "gv_cmn_emails"("status", "scheduled_at");

-- CreateIndex
CREATE INDEX "gv_cmn_emails_tracking_pixel_id_idx" ON "gv_cmn_emails"("tracking_pixel_id");

-- CreateIndex
CREATE INDEX "gv_cmn_emails_tenant_id_idx" ON "gv_cmn_emails"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cmn_emails_tenant_id_internet_message_id_key" ON "gv_cmn_emails"("tenant_id", "internet_message_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cmn_emails_tenant_id_tracking_pixel_id_key" ON "gv_cmn_emails"("tenant_id", "tracking_pixel_id");

-- CreateIndex
CREATE INDEX "gv_cmn_email_attachments_is_deleted_idx" ON "gv_cmn_email_attachments"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cmn_email_attachments_email_id_idx" ON "gv_cmn_email_attachments"("email_id");

-- CreateIndex
CREATE INDEX "gv_cmn_email_attachments_tenant_id_idx" ON "gv_cmn_email_attachments"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cmn_email_templates_is_deleted_idx" ON "gv_cmn_email_templates"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cmn_email_templates_category_is_shared_idx" ON "gv_cmn_email_templates"("category", "is_shared");

-- CreateIndex
CREATE INDEX "gv_cmn_email_templates_tenant_id_idx" ON "gv_cmn_email_templates"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cmn_email_signatures_is_deleted_idx" ON "gv_cmn_email_signatures"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cmn_email_signatures_user_id_idx" ON "gv_cmn_email_signatures"("user_id");

-- CreateIndex
CREATE INDEX "gv_cmn_email_signatures_tenant_id_idx" ON "gv_cmn_email_signatures"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cmn_email_campaigns_is_deleted_idx" ON "gv_cmn_email_campaigns"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cmn_email_campaigns_status_scheduled_at_idx" ON "gv_cmn_email_campaigns"("status", "scheduled_at");

-- CreateIndex
CREATE INDEX "gv_cmn_email_campaigns_tenant_id_idx" ON "gv_cmn_email_campaigns"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cmn_campaign_recipients_is_deleted_idx" ON "gv_cmn_campaign_recipients"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cmn_campaign_recipients_campaign_id_status_idx" ON "gv_cmn_campaign_recipients"("campaign_id", "status");

-- CreateIndex
CREATE INDEX "gv_cmn_campaign_recipients_tenant_id_idx" ON "gv_cmn_campaign_recipients"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cmn_campaign_recipients_tenant_id_campaign_id_email_key" ON "gv_cmn_campaign_recipients"("tenant_id", "campaign_id", "email");

-- CreateIndex
CREATE INDEX "gv_cmn_email_tracking_events_is_deleted_idx" ON "gv_cmn_email_tracking_events"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cmn_email_tracking_events_email_id_event_type_idx" ON "gv_cmn_email_tracking_events"("email_id", "event_type");

-- CreateIndex
CREATE INDEX "gv_cmn_email_tracking_events_campaign_id_event_type_idx" ON "gv_cmn_email_tracking_events"("campaign_id", "event_type");

-- CreateIndex
CREATE INDEX "gv_cmn_email_tracking_events_tenant_id_idx" ON "gv_cmn_email_tracking_events"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cmn_email_unsubscribes_is_deleted_idx" ON "gv_cmn_email_unsubscribes"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cmn_email_unsubscribes_email_idx" ON "gv_cmn_email_unsubscribes"("email");

-- CreateIndex
CREATE INDEX "gv_cmn_email_unsubscribes_tenant_id_idx" ON "gv_cmn_email_unsubscribes"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cmn_email_unsubscribes_tenant_id_email_key" ON "gv_cmn_email_unsubscribes"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_business_accounts_is_deleted_idx" ON "gv_cmn_wa_business_accounts"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_business_accounts_tenant_id_idx" ON "gv_cmn_wa_business_accounts"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cmn_wa_business_accounts_tenant_id_waba_id_key" ON "gv_cmn_wa_business_accounts"("tenant_id", "waba_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cmn_wa_business_accounts_tenant_id_phone_number_id_key" ON "gv_cmn_wa_business_accounts"("tenant_id", "phone_number_id");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_conversations_is_deleted_idx" ON "gv_cmn_wa_conversations"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_conversations_waba_id_status_idx" ON "gv_cmn_wa_conversations"("waba_id", "status");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_conversations_waba_id_last_message_at_idx" ON "gv_cmn_wa_conversations"("waba_id", "last_message_at");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_conversations_assigned_to_id_idx" ON "gv_cmn_wa_conversations"("assigned_to_id");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_conversations_linked_entity_type_linked_entity_id_idx" ON "gv_cmn_wa_conversations"("linked_entity_type", "linked_entity_id");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_conversations_tenant_id_idx" ON "gv_cmn_wa_conversations"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cmn_wa_conversations_tenant_id_waba_id_contact_phone_key" ON "gv_cmn_wa_conversations"("tenant_id", "waba_id", "contact_phone");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_messages_is_deleted_idx" ON "gv_cmn_wa_messages"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_messages_conversation_id_created_at_idx" ON "gv_cmn_wa_messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_messages_waba_id_created_at_idx" ON "gv_cmn_wa_messages"("waba_id", "created_at");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_messages_status_idx" ON "gv_cmn_wa_messages"("status");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_messages_broadcast_id_idx" ON "gv_cmn_wa_messages"("broadcast_id");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_messages_tenant_id_idx" ON "gv_cmn_wa_messages"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cmn_wa_messages_tenant_id_wa_message_id_key" ON "gv_cmn_wa_messages"("tenant_id", "wa_message_id");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_templates_is_deleted_idx" ON "gv_cmn_wa_templates"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_templates_waba_id_status_idx" ON "gv_cmn_wa_templates"("waba_id", "status");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_templates_tenant_id_idx" ON "gv_cmn_wa_templates"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cmn_wa_templates_tenant_id_waba_id_name_language_key" ON "gv_cmn_wa_templates"("tenant_id", "waba_id", "name", "language");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cmn_wa_templates_tenant_id_meta_template_id_key" ON "gv_cmn_wa_templates"("tenant_id", "meta_template_id");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_broadcasts_is_deleted_idx" ON "gv_cmn_wa_broadcasts"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_broadcasts_waba_id_status_idx" ON "gv_cmn_wa_broadcasts"("waba_id", "status");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_broadcasts_scheduled_at_idx" ON "gv_cmn_wa_broadcasts"("scheduled_at");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_broadcasts_tenant_id_idx" ON "gv_cmn_wa_broadcasts"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_broadcast_recipients_is_deleted_idx" ON "gv_cmn_wa_broadcast_recipients"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_broadcast_recipients_broadcast_id_status_idx" ON "gv_cmn_wa_broadcast_recipients"("broadcast_id", "status");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_broadcast_recipients_tenant_id_idx" ON "gv_cmn_wa_broadcast_recipients"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_chatbot_flows_is_deleted_idx" ON "gv_cmn_wa_chatbot_flows"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_chatbot_flows_waba_id_status_idx" ON "gv_cmn_wa_chatbot_flows"("waba_id", "status");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_chatbot_flows_tenant_id_idx" ON "gv_cmn_wa_chatbot_flows"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_quick_replies_is_deleted_idx" ON "gv_cmn_wa_quick_replies"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_quick_replies_tenant_id_idx" ON "gv_cmn_wa_quick_replies"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cmn_wa_quick_replies_tenant_id_waba_id_shortcut_key" ON "gv_cmn_wa_quick_replies"("tenant_id", "waba_id", "shortcut");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_opt_outs_is_deleted_idx" ON "gv_cmn_wa_opt_outs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_opt_outs_waba_id_idx" ON "gv_cmn_wa_opt_outs"("waba_id");

-- CreateIndex
CREATE INDEX "gv_cmn_wa_opt_outs_tenant_id_idx" ON "gv_cmn_wa_opt_outs"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cmn_wa_opt_outs_tenant_id_waba_id_phone_number_key" ON "gv_cmn_wa_opt_outs"("tenant_id", "waba_id", "phone_number");

-- CreateIndex
CREATE INDEX "gv_cmn_email_footer_templates_is_deleted_idx" ON "gv_cmn_email_footer_templates"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cmn_email_footer_templates_tenant_id_is_default_idx" ON "gv_cmn_email_footer_templates"("tenant_id", "is_default");

-- CreateIndex
CREATE INDEX "gv_cmn_communication_logs_is_deleted_idx" ON "gv_cmn_communication_logs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cmn_communication_logs_tenant_id_channel_created_at_idx" ON "gv_cmn_communication_logs"("tenant_id", "channel", "created_at");

-- CreateIndex
CREATE INDEX "gv_cmn_communication_logs_tenant_id_entity_type_entity_id_idx" ON "gv_cmn_communication_logs"("tenant_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "gv_cmn_communication_logs_tenant_id_recipient_id_idx" ON "gv_cmn_communication_logs"("tenant_id", "recipient_id");

-- CreateIndex
CREATE INDEX "gv_cmn_communication_logs_channel_status_idx" ON "gv_cmn_communication_logs"("channel", "status");

-- CreateIndex
CREATE INDEX "gv_cfg_brands_is_deleted_idx" ON "gv_cfg_brands"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_brands_tenant_id_idx" ON "gv_cfg_brands"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_brands_tenant_id_name_key" ON "gv_cfg_brands"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_brands_tenant_id_code_key" ON "gv_cfg_brands"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "gv_cfg_brand_organizations_is_deleted_idx" ON "gv_cfg_brand_organizations"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_brand_organizations_tenant_id_idx" ON "gv_cfg_brand_organizations"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_brand_organizations_tenant_id_brand_id_organization__key" ON "gv_cfg_brand_organizations"("tenant_id", "brand_id", "organization_id");

-- CreateIndex
CREATE INDEX "gv_cfg_brand_contacts_is_deleted_idx" ON "gv_cfg_brand_contacts"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_brand_contacts_tenant_id_idx" ON "gv_cfg_brand_contacts"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_brand_contacts_tenant_id_brand_id_contact_id_key" ON "gv_cfg_brand_contacts"("tenant_id", "brand_id", "contact_id");

-- CreateIndex
CREATE INDEX "gv_cfg_business_locations_is_deleted_idx" ON "gv_cfg_business_locations"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_business_locations_level_parent_id_idx" ON "gv_cfg_business_locations"("level", "parent_id");

-- CreateIndex
CREATE INDEX "gv_cfg_business_locations_tenant_id_idx" ON "gv_cfg_business_locations"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_business_locations_tenant_id_code_key" ON "gv_cfg_business_locations"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "gv_cfg_company_countries_is_deleted_idx" ON "gv_cfg_company_countries"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_company_countries_tenant_id_idx" ON "gv_cfg_company_countries"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_company_countries_tenant_id_country_code_key" ON "gv_cfg_company_countries"("tenant_id", "country_code");

-- CreateIndex
CREATE INDEX "gv_cfg_company_states_is_deleted_idx" ON "gv_cfg_company_states"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_company_states_tenant_id_idx" ON "gv_cfg_company_states"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_company_states_tenant_id_company_country_id_state_co_key" ON "gv_cfg_company_states"("tenant_id", "company_country_id", "state_code");

-- CreateIndex
CREATE INDEX "gv_cfg_company_cities_is_deleted_idx" ON "gv_cfg_company_cities"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_company_cities_tenant_id_idx" ON "gv_cfg_company_cities"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_company_cities_tenant_id_company_state_id_city_name_key" ON "gv_cfg_company_cities"("tenant_id", "company_state_id", "city_name");

-- CreateIndex
CREATE INDEX "gv_cfg_company_pincodes_is_deleted_idx" ON "gv_cfg_company_pincodes"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_company_pincodes_tenant_id_idx" ON "gv_cfg_company_pincodes"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_company_pincodes_tenant_id_company_city_id_pincode_key" ON "gv_cfg_company_pincodes"("tenant_id", "company_city_id", "pincode");

-- CreateIndex
CREATE INDEX "gv_cfg_custom_field_definitions_is_deleted_idx" ON "gv_cfg_custom_field_definitions"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_custom_field_definitions_entity_type_is_active_idx" ON "gv_cfg_custom_field_definitions"("entity_type", "is_active");

-- CreateIndex
CREATE INDEX "gv_cfg_custom_field_definitions_tenant_id_idx" ON "gv_cfg_custom_field_definitions"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_custom_field_definitions_tenant_id_entity_type_field_key" ON "gv_cfg_custom_field_definitions"("tenant_id", "entity_type", "field_name");

-- CreateIndex
CREATE INDEX "gv_cfg_entity_config_values_is_deleted_idx" ON "gv_cfg_entity_config_values"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_entity_config_values_entity_type_entity_id_idx" ON "gv_cfg_entity_config_values"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "gv_cfg_entity_config_values_definition_id_value_text_idx" ON "gv_cfg_entity_config_values"("definition_id", "value_text");

-- CreateIndex
CREATE INDEX "gv_cfg_entity_config_values_definition_id_value_number_idx" ON "gv_cfg_entity_config_values"("definition_id", "value_number");

-- CreateIndex
CREATE INDEX "gv_cfg_entity_config_values_definition_id_value_dropdown_idx" ON "gv_cfg_entity_config_values"("definition_id", "value_dropdown");

-- CreateIndex
CREATE INDEX "gv_cfg_entity_config_values_tenant_id_idx" ON "gv_cfg_entity_config_values"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_entity_config_values_tenant_id_definition_id_entity__key" ON "gv_cfg_entity_config_values"("tenant_id", "definition_id", "entity_id");

-- CreateIndex
CREATE INDEX "gv_cfg_sync_policies_is_deleted_idx" ON "gv_cfg_sync_policies"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_sync_policies_tenant_id_idx" ON "gv_cfg_sync_policies"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_sync_policies_tenant_id_entity_name_key" ON "gv_cfg_sync_policies"("tenant_id", "entity_name");

-- CreateIndex
CREATE INDEX "gv_cfg_sync_warning_rules_is_deleted_idx" ON "gv_cfg_sync_warning_rules"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_sync_warning_rules_trigger_is_enabled_idx" ON "gv_cfg_sync_warning_rules"("trigger", "is_enabled");

-- CreateIndex
CREATE INDEX "gv_cfg_sync_warning_rules_tenant_id_idx" ON "gv_cfg_sync_warning_rules"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cfg_sync_devices_is_deleted_idx" ON "gv_cfg_sync_devices"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_sync_devices_user_id_status_idx" ON "gv_cfg_sync_devices"("user_id", "status");

-- CreateIndex
CREATE INDEX "gv_cfg_sync_devices_tenant_id_idx" ON "gv_cfg_sync_devices"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_sync_devices_tenant_id_user_id_device_id_key" ON "gv_cfg_sync_devices"("tenant_id", "user_id", "device_id");

-- CreateIndex
CREATE INDEX "gv_cfg_sync_conflicts_is_deleted_idx" ON "gv_cfg_sync_conflicts"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_sync_conflicts_user_id_status_idx" ON "gv_cfg_sync_conflicts"("user_id", "status");

-- CreateIndex
CREATE INDEX "gv_cfg_sync_conflicts_entity_name_entity_id_idx" ON "gv_cfg_sync_conflicts"("entity_name", "entity_id");

-- CreateIndex
CREATE INDEX "gv_cfg_sync_conflicts_tenant_id_idx" ON "gv_cfg_sync_conflicts"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cfg_sync_flush_commands_is_deleted_idx" ON "gv_cfg_sync_flush_commands"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_sync_flush_commands_target_user_id_status_idx" ON "gv_cfg_sync_flush_commands"("target_user_id", "status");

-- CreateIndex
CREATE INDEX "gv_cfg_sync_flush_commands_tenant_id_idx" ON "gv_cfg_sync_flush_commands"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_cron_job_configs_job_code_key" ON "gv_cfg_cron_job_configs"("job_code");

-- CreateIndex
CREATE INDEX "gv_cfg_cron_job_configs_status_idx" ON "gv_cfg_cron_job_configs"("status");

-- CreateIndex
CREATE INDEX "gv_cfg_business_hours_schedules_is_deleted_idx" ON "gv_cfg_business_hours_schedules"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_business_hours_schedules_tenant_id_idx" ON "gv_cfg_business_hours_schedules"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_business_hours_schedules_tenant_id_dayOfWeek_key" ON "gv_cfg_business_hours_schedules"("tenant_id", "dayOfWeek");

-- CreateIndex
CREATE INDEX "gv_cfg_holiday_calendars_is_deleted_idx" ON "gv_cfg_holiday_calendars"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_holiday_calendars_tenant_id_date_idx" ON "gv_cfg_holiday_calendars"("tenant_id", "date");

-- CreateIndex
CREATE INDEX "gv_cfg_calendar_highlights_is_deleted_idx" ON "gv_cfg_calendar_highlights"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_calendar_highlights_tenant_id_date_idx" ON "gv_cfg_calendar_highlights"("tenant_id", "date");

-- CreateIndex
CREATE INDEX "gv_cfg_calendar_highlights_date_highlight_type_idx" ON "gv_cfg_calendar_highlights"("date", "highlight_type");

-- CreateIndex
CREATE INDEX "gv_cfg_auto_number_sequences_is_deleted_idx" ON "gv_cfg_auto_number_sequences"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_auto_number_sequences_tenant_id_idx" ON "gv_cfg_auto_number_sequences"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_auto_number_sequences_tenant_id_entity_name_key" ON "gv_cfg_auto_number_sequences"("tenant_id", "entity_name");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_company_profiles_tenant_id_key" ON "gv_cfg_company_profiles"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cfg_company_profiles_is_deleted_idx" ON "gv_cfg_company_profiles"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_company_profiles_tenant_id_idx" ON "gv_cfg_company_profiles"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_notion_configs_tenant_id_key" ON "gv_cfg_notion_configs"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cfg_notion_configs_is_deleted_idx" ON "gv_cfg_notion_configs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_notion_configs_tenant_id_idx" ON "gv_cfg_notion_configs"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_api_keys_key_hash_key" ON "gv_cfg_api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "gv_cfg_api_keys_is_deleted_idx" ON "gv_cfg_api_keys"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_api_keys_tenant_id_status_idx" ON "gv_cfg_api_keys"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "gv_cfg_api_keys_key_hash_idx" ON "gv_cfg_api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "gv_cfg_webhook_endpoints_is_deleted_idx" ON "gv_cfg_webhook_endpoints"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_webhook_endpoints_tenant_id_status_idx" ON "gv_cfg_webhook_endpoints"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "gv_cfg_webhook_deliveries_is_deleted_idx" ON "gv_cfg_webhook_deliveries"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_webhook_deliveries_endpoint_id_status_scheduled_at_idx" ON "gv_cfg_webhook_deliveries"("endpoint_id", "status", "scheduled_at");

-- CreateIndex
CREATE INDEX "gv_cfg_webhook_deliveries_tenant_id_event_type_created_at_idx" ON "gv_cfg_webhook_deliveries"("tenant_id", "event_type", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_rate_limit_tiers_plan_code_key" ON "gv_cfg_rate_limit_tiers"("plan_code");

-- CreateIndex
CREATE INDEX "gv_cfg_table_configs_is_deleted_idx" ON "gv_cfg_table_configs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_table_configs_tenant_id_table_key_idx" ON "gv_cfg_table_configs"("tenant_id", "table_key");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_table_configs_tenant_id_table_key_user_id_key" ON "gv_cfg_table_configs"("tenant_id", "table_key", "user_id");

-- CreateIndex
CREATE INDEX "gv_cfg_data_masking_policies_is_deleted_idx" ON "gv_cfg_data_masking_policies"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_data_masking_policies_tenant_id_table_key_idx" ON "gv_cfg_data_masking_policies"("tenant_id", "table_key");

-- CreateIndex
CREATE INDEX "gv_cfg_quiet_hour_configs_is_deleted_idx" ON "gv_cfg_quiet_hour_configs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_quiet_hour_configs_tenant_id_user_id_idx" ON "gv_cfg_quiet_hour_configs"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "gv_cfg_user_calendar_syncs_is_deleted_idx" ON "gv_cfg_user_calendar_syncs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_user_calendar_syncs_tenant_id_user_id_idx" ON "gv_cfg_user_calendar_syncs"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_user_calendar_syncs_tenant_id_user_id_provider_key" ON "gv_cfg_user_calendar_syncs"("tenant_id", "user_id", "provider");

-- CreateIndex
CREATE INDEX "gv_cfg_user_availability_is_deleted_idx" ON "gv_cfg_user_availability"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_user_availability_tenant_id_user_id_idx" ON "gv_cfg_user_availability"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_user_availability_tenant_id_user_id_day_of_week_key" ON "gv_cfg_user_availability"("tenant_id", "user_id", "day_of_week");

-- CreateIndex
CREATE INDEX "gv_cfg_blocked_slots_is_deleted_idx" ON "gv_cfg_blocked_slots"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_blocked_slots_tenant_id_user_id_start_time_end_time_idx" ON "gv_cfg_blocked_slots"("tenant_id", "user_id", "start_time", "end_time");

-- CreateIndex
CREATE INDEX "gv_cfg_calendar_configs_is_deleted_idx" ON "gv_cfg_calendar_configs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_calendar_configs_tenant_id_idx" ON "gv_cfg_calendar_configs"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_calendar_configs_tenant_id_config_key_key" ON "gv_cfg_calendar_configs"("tenant_id", "config_key");

-- CreateIndex
CREATE INDEX "gv_cfg_google_connections_is_deleted_idx" ON "gv_cfg_google_connections"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_google_connections_tenant_id_idx" ON "gv_cfg_google_connections"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_google_connections_tenant_id_user_id_key" ON "gv_cfg_google_connections"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_ai_settings_tenant_id_key" ON "gv_cfg_ai_settings"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cfg_ai_settings_is_deleted_idx" ON "gv_cfg_ai_settings"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_ai_settings_tenant_id_idx" ON "gv_cfg_ai_settings"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cfg_shortcut_definitions_is_deleted_idx" ON "gv_cfg_shortcut_definitions"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_shortcut_definitions_tenant_id_category_idx" ON "gv_cfg_shortcut_definitions"("tenant_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_shortcut_definitions_tenant_id_code_key" ON "gv_cfg_shortcut_definitions"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "gv_cfg_shortcut_user_overrides_is_deleted_idx" ON "gv_cfg_shortcut_user_overrides"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_shortcut_user_overrides_tenant_id_idx" ON "gv_cfg_shortcut_user_overrides"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_shortcut_user_overrides_tenant_id_user_id_shortcut_i_key" ON "gv_cfg_shortcut_user_overrides"("tenant_id", "user_id", "shortcut_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_shortcut_user_overrides_tenant_id_user_id_custom_key_key" ON "gv_cfg_shortcut_user_overrides"("tenant_id", "user_id", "custom_key");

-- CreateIndex
CREATE INDEX "gv_cfg_ai_models_is_deleted_idx" ON "gv_cfg_ai_models"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_ai_models_tenant_id_source_idx" ON "gv_cfg_ai_models"("tenant_id", "source");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_ai_models_tenant_id_model_id_key" ON "gv_cfg_ai_models"("tenant_id", "model_id");

-- CreateIndex
CREATE INDEX "gv_cfg_ai_datasets_is_deleted_idx" ON "gv_cfg_ai_datasets"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_ai_datasets_tenant_id_status_idx" ON "gv_cfg_ai_datasets"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "gv_cfg_ai_documents_is_deleted_idx" ON "gv_cfg_ai_documents"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_ai_documents_tenant_id_dataset_id_idx" ON "gv_cfg_ai_documents"("tenant_id", "dataset_id");

-- CreateIndex
CREATE INDEX "gv_cfg_ai_training_jobs_is_deleted_idx" ON "gv_cfg_ai_training_jobs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_ai_training_jobs_tenant_id_status_idx" ON "gv_cfg_ai_training_jobs"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "gv_cfg_ai_embeddings_is_deleted_idx" ON "gv_cfg_ai_embeddings"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_ai_embeddings_tenant_id_dataset_id_idx" ON "gv_cfg_ai_embeddings"("tenant_id", "dataset_id");

-- CreateIndex
CREATE INDEX "gv_cfg_ai_embeddings_document_id_idx" ON "gv_cfg_ai_embeddings"("document_id");

-- CreateIndex
CREATE INDEX "gv_cfg_ai_chat_sessions_is_deleted_idx" ON "gv_cfg_ai_chat_sessions"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_ai_chat_sessions_tenant_id_user_id_idx" ON "gv_cfg_ai_chat_sessions"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "gv_cfg_ai_chat_sessions_tenant_id_status_idx" ON "gv_cfg_ai_chat_sessions"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "gv_cfg_ai_chat_messages_is_deleted_idx" ON "gv_cfg_ai_chat_messages"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_ai_chat_messages_session_id_idx" ON "gv_cfg_ai_chat_messages"("session_id");

-- CreateIndex
CREATE INDEX "gv_cfg_ai_chat_messages_tenant_id_idx" ON "gv_cfg_ai_chat_messages"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cfg_ai_system_prompts_is_deleted_idx" ON "gv_cfg_ai_system_prompts"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_ai_system_prompts_tenant_id_category_idx" ON "gv_cfg_ai_system_prompts"("tenant_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_control_room_rules_rule_code_key" ON "gv_cfg_control_room_rules"("rule_code");

-- CreateIndex
CREATE INDEX "gv_cfg_control_room_rules_category_sort_order_idx" ON "gv_cfg_control_room_rules"("category", "sort_order");

-- CreateIndex
CREATE INDEX "gv_cfg_control_room_values_is_deleted_idx" ON "gv_cfg_control_room_values"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_control_room_values_tenant_id_level_idx" ON "gv_cfg_control_room_values"("tenant_id", "level");

-- CreateIndex
CREATE INDEX "gv_cfg_control_room_values_rule_id_tenant_id_idx" ON "gv_cfg_control_room_values"("rule_id", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_control_room_values_tenant_id_rule_id_level_page_cod_key" ON "gv_cfg_control_room_values"("tenant_id", "rule_id", "level", "page_code", "role_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_rule_cache_versions_tenant_id_key" ON "gv_cfg_rule_cache_versions"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cfg_rule_cache_versions_is_deleted_idx" ON "gv_cfg_rule_cache_versions"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_rule_cache_versions_tenant_id_idx" ON "gv_cfg_rule_cache_versions"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_cfg_control_room_drafts_is_deleted_idx" ON "gv_cfg_control_room_drafts"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_cfg_control_room_drafts_tenant_id_status_idx" ON "gv_cfg_control_room_drafts"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "gv_cfg_control_room_drafts_tenant_id_rule_id_level_key" ON "gv_cfg_control_room_drafts"("tenant_id", "rule_id", "level");

-- CreateIndex
CREATE INDEX "gv_cfg_saved_filters_tenant_id_entity_type_idx" ON "gv_cfg_saved_filters"("tenant_id", "entity_type");

-- CreateIndex
CREATE INDEX "gv_cfg_saved_filters_tenant_id_created_by_id_idx" ON "gv_cfg_saved_filters"("tenant_id", "created_by_id");

-- CreateIndex
CREATE INDEX "gv_cfg_saved_filters_is_deleted_idx" ON "gv_cfg_saved_filters"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_raw_contacts_status_idx" ON "gv_crm_raw_contacts"("status");

-- CreateIndex
CREATE INDEX "gv_crm_raw_contacts_first_name_last_name_idx" ON "gv_crm_raw_contacts"("first_name", "last_name");

-- CreateIndex
CREATE INDEX "gv_crm_raw_contacts_tenant_id_idx" ON "gv_crm_raw_contacts"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_crm_raw_contacts_is_deleted_idx" ON "gv_crm_raw_contacts"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_raw_contact_filters_is_deleted_idx" ON "gv_crm_raw_contact_filters"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_raw_contact_filters_tenant_id_idx" ON "gv_crm_raw_contact_filters"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_raw_contact_filters_tenant_id_raw_contact_id_lookup__key" ON "gv_crm_raw_contact_filters"("tenant_id", "raw_contact_id", "lookup_value_id");

-- CreateIndex
CREATE INDEX "gv_crm_contacts_first_name_last_name_idx" ON "gv_crm_contacts"("first_name", "last_name");

-- CreateIndex
CREATE INDEX "gv_crm_contacts_tenant_id_idx" ON "gv_crm_contacts"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_crm_contacts_is_deleted_idx" ON "gv_crm_contacts"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_contact_filters_is_deleted_idx" ON "gv_crm_contact_filters"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_contact_filters_tenant_id_idx" ON "gv_crm_contact_filters"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_contact_filters_tenant_id_contact_id_lookup_value_id_key" ON "gv_crm_contact_filters"("tenant_id", "contact_id", "lookup_value_id");

-- CreateIndex
CREATE INDEX "gv_crm_organizations_tenant_id_idx" ON "gv_crm_organizations"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_crm_organizations_is_deleted_idx" ON "gv_crm_organizations"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_organization_filters_is_deleted_idx" ON "gv_crm_organization_filters"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_organization_filters_tenant_id_idx" ON "gv_crm_organization_filters"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_organization_filters_tenant_id_organization_id_looku_key" ON "gv_crm_organization_filters"("tenant_id", "organization_id", "lookup_value_id");

-- CreateIndex
CREATE INDEX "gv_crm_contact_organizations_is_deleted_idx" ON "gv_crm_contact_organizations"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_contact_organizations_organization_id_is_active_idx" ON "gv_crm_contact_organizations"("organization_id", "is_active");

-- CreateIndex
CREATE INDEX "gv_crm_contact_organizations_contact_id_is_active_idx" ON "gv_crm_contact_organizations"("contact_id", "is_active");

-- CreateIndex
CREATE INDEX "gv_crm_contact_organizations_tenant_id_idx" ON "gv_crm_contact_organizations"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_contact_organizations_tenant_id_contact_id_organizat_key" ON "gv_crm_contact_organizations"("tenant_id", "contact_id", "organization_id", "relation_type");

-- CreateIndex
CREATE INDEX "gv_crm_communications_is_deleted_idx" ON "gv_crm_communications"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_communications_raw_contact_id_idx" ON "gv_crm_communications"("raw_contact_id");

-- CreateIndex
CREATE INDEX "gv_crm_communications_contact_id_idx" ON "gv_crm_communications"("contact_id");

-- CreateIndex
CREATE INDEX "gv_crm_communications_organization_id_idx" ON "gv_crm_communications"("organization_id");

-- CreateIndex
CREATE INDEX "gv_crm_communications_lead_id_idx" ON "gv_crm_communications"("lead_id");

-- CreateIndex
CREATE INDEX "gv_crm_communications_type_value_idx" ON "gv_crm_communications"("type", "value");

-- CreateIndex
CREATE INDEX "gv_crm_communications_tenant_id_idx" ON "gv_crm_communications"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_crm_leads_status_allocated_to_id_idx" ON "gv_crm_leads"("status", "allocated_to_id");

-- CreateIndex
CREATE INDEX "gv_crm_leads_tenant_id_idx" ON "gv_crm_leads"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_crm_leads_is_deleted_idx" ON "gv_crm_leads"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_leads_tenant_id_lead_number_key" ON "gv_crm_leads"("tenant_id", "lead_number");

-- CreateIndex
CREATE INDEX "gv_crm_lead_filters_is_deleted_idx" ON "gv_crm_lead_filters"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_lead_filters_tenant_id_idx" ON "gv_crm_lead_filters"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_lead_filters_tenant_id_lead_id_lookup_value_id_key" ON "gv_crm_lead_filters"("tenant_id", "lead_id", "lookup_value_id");

-- CreateIndex
CREATE INDEX "gv_crm_activities_lead_id_type_idx" ON "gv_crm_activities"("lead_id", "type");

-- CreateIndex
CREATE INDEX "gv_crm_activities_tenant_id_idx" ON "gv_crm_activities"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_crm_activities_is_deleted_idx" ON "gv_crm_activities"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_demos_is_deleted_idx" ON "gv_crm_demos"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_demos_lead_id_status_idx" ON "gv_crm_demos"("lead_id", "status");

-- CreateIndex
CREATE INDEX "gv_crm_demos_tenant_id_idx" ON "gv_crm_demos"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_crm_tour_plans_is_deleted_idx" ON "gv_crm_tour_plans"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_tour_plans_sales_person_id_plan_date_idx" ON "gv_crm_tour_plans"("sales_person_id", "plan_date");

-- CreateIndex
CREATE INDEX "gv_crm_tour_plans_tenant_id_idx" ON "gv_crm_tour_plans"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_crm_entity_owners_is_deleted_idx" ON "gv_crm_entity_owners"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_entity_owners_entity_type_entity_id_is_active_idx" ON "gv_crm_entity_owners"("entity_type", "entity_id", "is_active");

-- CreateIndex
CREATE INDEX "gv_crm_entity_owners_user_id_entity_type_is_active_idx" ON "gv_crm_entity_owners"("user_id", "entity_type", "is_active");

-- CreateIndex
CREATE INDEX "gv_crm_entity_owners_tenant_id_idx" ON "gv_crm_entity_owners"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_crm_ownership_logs_is_deleted_idx" ON "gv_crm_ownership_logs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_ownership_logs_entity_type_entity_id_idx" ON "gv_crm_ownership_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "gv_crm_ownership_logs_tenant_id_idx" ON "gv_crm_ownership_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_crm_assignment_rules_is_deleted_idx" ON "gv_crm_assignment_rules"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_assignment_rules_entity_type_trigger_event_is_active_idx" ON "gv_crm_assignment_rules"("entity_type", "trigger_event", "is_active");

-- CreateIndex
CREATE INDEX "gv_crm_assignment_rules_priority_idx" ON "gv_crm_assignment_rules"("priority");

-- CreateIndex
CREATE INDEX "gv_crm_assignment_rules_tenant_id_idx" ON "gv_crm_assignment_rules"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_assignment_rules_tenant_id_name_key" ON "gv_crm_assignment_rules"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "gv_crm_manufacturers_is_deleted_idx" ON "gv_crm_manufacturers"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_manufacturers_tenant_id_idx" ON "gv_crm_manufacturers"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_manufacturers_tenant_id_name_key" ON "gv_crm_manufacturers"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_manufacturers_tenant_id_code_key" ON "gv_crm_manufacturers"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "gv_crm_manufacturer_organizations_is_deleted_idx" ON "gv_crm_manufacturer_organizations"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_manufacturer_organizations_tenant_id_idx" ON "gv_crm_manufacturer_organizations"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_manufacturer_organizations_tenant_id_manufacturer_id_key" ON "gv_crm_manufacturer_organizations"("tenant_id", "manufacturer_id", "organization_id");

-- CreateIndex
CREATE INDEX "gv_crm_manufacturer_contacts_is_deleted_idx" ON "gv_crm_manufacturer_contacts"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_manufacturer_contacts_tenant_id_idx" ON "gv_crm_manufacturer_contacts"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_manufacturer_contacts_tenant_id_manufacturer_id_cont_key" ON "gv_crm_manufacturer_contacts"("tenant_id", "manufacturer_id", "contact_id");

-- CreateIndex
CREATE INDEX "gv_crm_organization_locations_is_deleted_idx" ON "gv_crm_organization_locations"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_organization_locations_tenant_id_idx" ON "gv_crm_organization_locations"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_organization_locations_tenant_id_organization_id_loc_key" ON "gv_crm_organization_locations"("tenant_id", "organization_id", "location_id");

-- CreateIndex
CREATE INDEX "gv_crm_follow_ups_is_deleted_idx" ON "gv_crm_follow_ups"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_follow_ups_assigned_to_id_is_active_idx" ON "gv_crm_follow_ups"("assigned_to_id", "is_active");

-- CreateIndex
CREATE INDEX "gv_crm_follow_ups_due_date_is_overdue_idx" ON "gv_crm_follow_ups"("due_date", "is_overdue");

-- CreateIndex
CREATE INDEX "gv_crm_follow_ups_entity_type_entity_id_idx" ON "gv_crm_follow_ups"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "gv_crm_follow_ups_tenant_id_idx" ON "gv_crm_follow_ups"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_crm_recurring_events_is_deleted_idx" ON "gv_crm_recurring_events"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_recurring_events_next_occurrence_is_active_idx" ON "gv_crm_recurring_events"("next_occurrence", "is_active");

-- CreateIndex
CREATE INDEX "gv_crm_recurring_events_created_by_id_idx" ON "gv_crm_recurring_events"("created_by_id");

-- CreateIndex
CREATE INDEX "gv_crm_recurring_events_tenant_id_idx" ON "gv_crm_recurring_events"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_crm_tour_plan_visits_is_deleted_idx" ON "gv_crm_tour_plan_visits"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_tour_plan_visits_tour_plan_id_sort_order_idx" ON "gv_crm_tour_plan_visits"("tour_plan_id", "sort_order");

-- CreateIndex
CREATE INDEX "gv_crm_tour_plan_visits_tenant_id_idx" ON "gv_crm_tour_plan_visits"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_crm_tour_plan_photos_is_deleted_idx" ON "gv_crm_tour_plan_photos"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_tour_plan_photos_tour_plan_visit_id_idx" ON "gv_crm_tour_plan_photos"("tour_plan_visit_id");

-- CreateIndex
CREATE INDEX "gv_crm_tour_plan_photos_tenant_id_idx" ON "gv_crm_tour_plan_photos"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_crm_calendar_events_is_deleted_idx" ON "gv_crm_calendar_events"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_calendar_events_user_id_start_time_idx" ON "gv_crm_calendar_events"("user_id", "start_time");

-- CreateIndex
CREATE INDEX "gv_crm_calendar_events_start_time_end_time_idx" ON "gv_crm_calendar_events"("start_time", "end_time");

-- CreateIndex
CREATE INDEX "gv_crm_calendar_events_tenant_id_idx" ON "gv_crm_calendar_events"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_calendar_events_tenant_id_event_type_source_id_key" ON "gv_crm_calendar_events"("tenant_id", "event_type", "source_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_support_tickets_ticket_no_key" ON "gv_crm_support_tickets"("ticket_no");

-- CreateIndex
CREATE INDEX "gv_crm_support_tickets_is_deleted_idx" ON "gv_crm_support_tickets"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_support_tickets_tenant_id_status_idx" ON "gv_crm_support_tickets"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "gv_crm_support_tickets_assigned_to_id_status_idx" ON "gv_crm_support_tickets"("assigned_to_id", "status");

-- CreateIndex
CREATE INDEX "gv_crm_support_tickets_priority_status_idx" ON "gv_crm_support_tickets"("priority", "status");

-- CreateIndex
CREATE INDEX "gv_crm_support_ticket_messages_ticket_id_created_at_idx" ON "gv_crm_support_ticket_messages"("ticket_id", "created_at");

-- CreateIndex
CREATE INDEX "gv_crm_tasks_tenant_id_assigned_to_id_status_idx" ON "gv_crm_tasks"("tenant_id", "assigned_to_id", "status");

-- CreateIndex
CREATE INDEX "gv_crm_tasks_tenant_id_created_by_id_idx" ON "gv_crm_tasks"("tenant_id", "created_by_id");

-- CreateIndex
CREATE INDEX "gv_crm_tasks_tenant_id_assigned_department_id_idx" ON "gv_crm_tasks"("tenant_id", "assigned_department_id");

-- CreateIndex
CREATE INDEX "gv_crm_tasks_tenant_id_due_date_idx" ON "gv_crm_tasks"("tenant_id", "due_date");

-- CreateIndex
CREATE INDEX "gv_crm_tasks_tenant_id_entity_type_entity_id_idx" ON "gv_crm_tasks"("tenant_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "gv_crm_tasks_tenant_id_status_priority_idx" ON "gv_crm_tasks"("tenant_id", "status", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_tasks_tenant_id_task_number_key" ON "gv_crm_tasks"("tenant_id", "task_number");

-- CreateIndex
CREATE INDEX "gv_crm_task_history_is_deleted_idx" ON "gv_crm_task_history"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_task_history_task_id_idx" ON "gv_crm_task_history"("task_id");

-- CreateIndex
CREATE INDEX "gv_crm_task_history_tenant_id_changed_by_id_idx" ON "gv_crm_task_history"("tenant_id", "changed_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_task_watchers_task_id_user_id_key" ON "gv_crm_task_watchers"("task_id", "user_id");

-- CreateIndex
CREATE INDEX "gv_crm_comments_is_deleted_idx" ON "gv_crm_comments"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_comments_entity_type_entity_id_idx" ON "gv_crm_comments"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "gv_crm_comments_tenant_id_entity_type_entity_id_visibility_idx" ON "gv_crm_comments"("tenant_id", "entity_type", "entity_id", "visibility");

-- CreateIndex
CREATE INDEX "gv_crm_comments_task_id_idx" ON "gv_crm_comments"("task_id");

-- CreateIndex
CREATE INDEX "gv_crm_comments_author_id_idx" ON "gv_crm_comments"("author_id");

-- CreateIndex
CREATE INDEX "gv_crm_comments_tenant_id_idx" ON "gv_crm_comments"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_crm_task_logic_configs_is_deleted_idx" ON "gv_crm_task_logic_configs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_task_logic_configs_tenant_id_idx" ON "gv_crm_task_logic_configs"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_task_logic_configs_tenant_id_config_key_key" ON "gv_crm_task_logic_configs"("tenant_id", "config_key");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_scheduled_events_event_number_key" ON "gv_crm_scheduled_events"("event_number");

-- CreateIndex
CREATE INDEX "gv_crm_scheduled_events_is_deleted_idx" ON "gv_crm_scheduled_events"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_scheduled_events_tenant_id_organizer_id_start_time_idx" ON "gv_crm_scheduled_events"("tenant_id", "organizer_id", "start_time");

-- CreateIndex
CREATE INDEX "gv_crm_scheduled_events_tenant_id_start_time_end_time_idx" ON "gv_crm_scheduled_events"("tenant_id", "start_time", "end_time");

-- CreateIndex
CREATE INDEX "gv_crm_scheduled_events_tenant_id_entity_type_entity_id_idx" ON "gv_crm_scheduled_events"("tenant_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "gv_crm_scheduled_events_external_event_id_sync_provider_idx" ON "gv_crm_scheduled_events"("external_event_id", "sync_provider");

-- CreateIndex
CREATE INDEX "gv_crm_scheduled_events_status_idx" ON "gv_crm_scheduled_events"("status");

-- CreateIndex
CREATE INDEX "gv_crm_event_participants_is_deleted_idx" ON "gv_crm_event_participants"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_event_participants_tenant_id_user_id_idx" ON "gv_crm_event_participants"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_event_participants_event_id_user_id_key" ON "gv_crm_event_participants"("event_id", "user_id");

-- CreateIndex
CREATE INDEX "gv_crm_event_history_is_deleted_idx" ON "gv_crm_event_history"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_event_history_event_id_idx" ON "gv_crm_event_history"("event_id");

-- CreateIndex
CREATE INDEX "gv_crm_event_history_tenant_id_changed_by_id_idx" ON "gv_crm_event_history"("tenant_id", "changed_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_entity_verification_records_verification_token_key" ON "gv_crm_entity_verification_records"("verification_token");

-- CreateIndex
CREATE INDEX "gv_crm_entity_verification_records_is_deleted_idx" ON "gv_crm_entity_verification_records"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_entity_verification_records_tenant_id_entity_type_en_idx" ON "gv_crm_entity_verification_records"("tenant_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "gv_crm_entity_verification_records_verification_token_idx" ON "gv_crm_entity_verification_records"("verification_token");

-- CreateIndex
CREATE INDEX "gv_crm_entity_verification_records_status_created_at_idx" ON "gv_crm_entity_verification_records"("status", "created_at");

-- CreateIndex
CREATE INDEX "gv_crm_warranty_templates_is_deleted_idx" ON "gv_crm_warranty_templates"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_warranty_templates_industry_code_is_system_template_idx" ON "gv_crm_warranty_templates"("industry_code", "is_system_template");

-- CreateIndex
CREATE INDEX "gv_crm_warranty_templates_tenant_id_idx" ON "gv_crm_warranty_templates"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_warranty_templates_tenant_id_code_key" ON "gv_crm_warranty_templates"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "gv_crm_warranty_records_tenant_id_customer_id_status_idx" ON "gv_crm_warranty_records"("tenant_id", "customer_id", "status");

-- CreateIndex
CREATE INDEX "gv_crm_warranty_records_tenant_id_end_date_idx" ON "gv_crm_warranty_records"("tenant_id", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_warranty_records_tenant_id_warranty_number_key" ON "gv_crm_warranty_records"("tenant_id", "warranty_number");

-- CreateIndex
CREATE INDEX "gv_crm_warranty_claims_tenant_id_idx" ON "gv_crm_warranty_claims"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_crm_warranty_claims_tenant_id_status_idx" ON "gv_crm_warranty_claims"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_warranty_claims_tenant_id_claim_number_key" ON "gv_crm_warranty_claims"("tenant_id", "claim_number");

-- CreateIndex
CREATE INDEX "gv_crm_amc_plan_templates_is_deleted_idx" ON "gv_crm_amc_plan_templates"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_amc_plan_templates_industry_code_is_system_template_idx" ON "gv_crm_amc_plan_templates"("industry_code", "is_system_template");

-- CreateIndex
CREATE INDEX "gv_crm_amc_plan_templates_tenant_id_idx" ON "gv_crm_amc_plan_templates"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_amc_plan_templates_tenant_id_code_key" ON "gv_crm_amc_plan_templates"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "gv_crm_amc_contracts_tenant_id_customer_id_status_idx" ON "gv_crm_amc_contracts"("tenant_id", "customer_id", "status");

-- CreateIndex
CREATE INDEX "gv_crm_amc_contracts_tenant_id_end_date_idx" ON "gv_crm_amc_contracts"("tenant_id", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_amc_contracts_tenant_id_contract_number_key" ON "gv_crm_amc_contracts"("tenant_id", "contract_number");

-- CreateIndex
CREATE INDEX "gv_crm_amc_schedules_is_deleted_idx" ON "gv_crm_amc_schedules"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_amc_schedules_tenant_id_schedule_date_status_idx" ON "gv_crm_amc_schedules"("tenant_id", "schedule_date", "status");

-- CreateIndex
CREATE INDEX "gv_crm_service_visit_logs_tenant_id_customer_id_idx" ON "gv_crm_service_visit_logs"("tenant_id", "customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_crm_service_visit_logs_tenant_id_visit_number_key" ON "gv_crm_service_visit_logs"("tenant_id", "visit_number");

-- CreateIndex
CREATE INDEX "gv_crm_service_charges_is_deleted_idx" ON "gv_crm_service_charges"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_crm_service_charges_tenant_id_idx" ON "gv_crm_service_charges"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_doc_import_profiles_is_deleted_idx" ON "gv_doc_import_profiles"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_doc_import_profiles_target_entity_status_idx" ON "gv_doc_import_profiles"("target_entity", "status");

-- CreateIndex
CREATE INDEX "gv_doc_import_profiles_tenant_id_idx" ON "gv_doc_import_profiles"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_doc_import_profiles_tenant_id_name_key" ON "gv_doc_import_profiles"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "gv_doc_import_jobs_is_deleted_idx" ON "gv_doc_import_jobs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_doc_import_jobs_status_created_by_id_idx" ON "gv_doc_import_jobs"("status", "created_by_id");

-- CreateIndex
CREATE INDEX "gv_doc_import_jobs_profile_id_idx" ON "gv_doc_import_jobs"("profile_id");

-- CreateIndex
CREATE INDEX "gv_doc_import_jobs_tenant_id_idx" ON "gv_doc_import_jobs"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_doc_import_rows_is_deleted_idx" ON "gv_doc_import_rows"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_doc_import_rows_import_job_id_row_status_idx" ON "gv_doc_import_rows"("import_job_id", "row_status");

-- CreateIndex
CREATE INDEX "gv_doc_import_rows_import_job_id_row_number_idx" ON "gv_doc_import_rows"("import_job_id", "row_number");

-- CreateIndex
CREATE INDEX "gv_doc_import_rows_tenant_id_idx" ON "gv_doc_import_rows"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_doc_export_jobs_is_deleted_idx" ON "gv_doc_export_jobs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_doc_export_jobs_tenant_id_idx" ON "gv_doc_export_jobs"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_doc_documents_is_deleted_idx" ON "gv_doc_documents"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_doc_documents_uploaded_by_id_status_idx" ON "gv_doc_documents"("uploaded_by_id", "status");

-- CreateIndex
CREATE INDEX "gv_doc_documents_folder_id_idx" ON "gv_doc_documents"("folder_id");

-- CreateIndex
CREATE INDEX "gv_doc_documents_category_idx" ON "gv_doc_documents"("category");

-- CreateIndex
CREATE INDEX "gv_doc_documents_storage_type_idx" ON "gv_doc_documents"("storage_type");

-- CreateIndex
CREATE INDEX "gv_doc_documents_tenant_id_idx" ON "gv_doc_documents"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_doc_attachments_is_deleted_idx" ON "gv_doc_attachments"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_doc_attachments_entity_type_entity_id_idx" ON "gv_doc_attachments"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "gv_doc_attachments_tenant_id_idx" ON "gv_doc_attachments"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_doc_attachments_tenant_id_document_id_entity_type_entity_key" ON "gv_doc_attachments"("tenant_id", "document_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "gv_doc_folders_is_deleted_idx" ON "gv_doc_folders"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_doc_folders_parent_id_idx" ON "gv_doc_folders"("parent_id");

-- CreateIndex
CREATE INDEX "gv_doc_folders_created_by_id_idx" ON "gv_doc_folders"("created_by_id");

-- CreateIndex
CREATE INDEX "gv_doc_folders_tenant_id_idx" ON "gv_doc_folders"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_doc_cloud_connections_is_deleted_idx" ON "gv_doc_cloud_connections"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_doc_cloud_connections_user_id_idx" ON "gv_doc_cloud_connections"("user_id");

-- CreateIndex
CREATE INDEX "gv_doc_cloud_connections_tenant_id_idx" ON "gv_doc_cloud_connections"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_doc_cloud_connections_tenant_id_provider_user_id_key" ON "gv_doc_cloud_connections"("tenant_id", "provider", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_doc_share_links_token_key" ON "gv_doc_share_links"("token");

-- CreateIndex
CREATE INDEX "gv_doc_share_links_is_deleted_idx" ON "gv_doc_share_links"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_doc_share_links_token_idx" ON "gv_doc_share_links"("token");

-- CreateIndex
CREATE INDEX "gv_doc_share_links_document_id_idx" ON "gv_doc_share_links"("document_id");

-- CreateIndex
CREATE INDEX "gv_doc_share_links_tenant_id_idx" ON "gv_doc_share_links"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_doc_activities_is_deleted_idx" ON "gv_doc_activities"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_doc_activities_document_id_idx" ON "gv_doc_activities"("document_id");

-- CreateIndex
CREATE INDEX "gv_doc_activities_user_id_idx" ON "gv_doc_activities"("user_id");

-- CreateIndex
CREATE INDEX "gv_doc_activities_tenant_id_idx" ON "gv_doc_activities"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_doc_templates_is_deleted_idx" ON "gv_doc_templates"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_doc_templates_document_type_industry_code_is_active_idx" ON "gv_doc_templates"("document_type", "industry_code", "is_active");

-- CreateIndex
CREATE INDEX "gv_doc_templates_tenant_id_idx" ON "gv_doc_templates"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_doc_templates_code_tenant_id_key" ON "gv_doc_templates"("code", "tenant_id");

-- CreateIndex
CREATE INDEX "gv_doc_tenant_template_customizations_is_deleted_idx" ON "gv_doc_tenant_template_customizations"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_doc_tenant_template_customizations_tenant_id_idx" ON "gv_doc_tenant_template_customizations"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_doc_tenant_template_customizations_tenant_id_template_id_key" ON "gv_doc_tenant_template_customizations"("tenant_id", "template_id");

-- CreateIndex
CREATE INDEX "gv_inv_products_code_idx" ON "gv_inv_products"("code");

-- CreateIndex
CREATE INDEX "gv_inv_products_parent_id_idx" ON "gv_inv_products"("parent_id");

-- CreateIndex
CREATE INDEX "gv_inv_products_status_is_active_idx" ON "gv_inv_products"("status", "is_active");

-- CreateIndex
CREATE INDEX "gv_inv_products_tenant_id_idx" ON "gv_inv_products"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_inv_products_tenant_id_code_key" ON "gv_inv_products"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "gv_inv_products_tenant_id_slug_key" ON "gv_inv_products"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "gv_inv_product_prices_is_deleted_idx" ON "gv_inv_product_prices"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_product_prices_product_id_price_type_price_group_id_idx" ON "gv_inv_product_prices"("product_id", "price_type", "price_group_id");

-- CreateIndex
CREATE INDEX "gv_inv_product_prices_tenant_id_idx" ON "gv_inv_product_prices"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_inv_customer_price_groups_is_deleted_idx" ON "gv_inv_customer_price_groups"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_customer_price_groups_tenant_id_idx" ON "gv_inv_customer_price_groups"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_inv_customer_price_groups_tenant_id_name_key" ON "gv_inv_customer_price_groups"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "gv_inv_customer_price_groups_tenant_id_code_key" ON "gv_inv_customer_price_groups"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "gv_inv_customer_group_mappings_is_deleted_idx" ON "gv_inv_customer_group_mappings"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_customer_group_mappings_tenant_id_idx" ON "gv_inv_customer_group_mappings"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_inv_customer_group_mappings_tenant_id_price_group_id_con_key" ON "gv_inv_customer_group_mappings"("tenant_id", "price_group_id", "contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_inv_customer_group_mappings_tenant_id_price_group_id_org_key" ON "gv_inv_customer_group_mappings"("tenant_id", "price_group_id", "organization_id");

-- CreateIndex
CREATE INDEX "gv_inv_product_tax_details_is_deleted_idx" ON "gv_inv_product_tax_details"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_product_tax_details_tenant_id_idx" ON "gv_inv_product_tax_details"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_inv_product_tax_details_tenant_id_product_id_tax_name_key" ON "gv_inv_product_tax_details"("tenant_id", "product_id", "tax_name");

-- CreateIndex
CREATE INDEX "gv_inv_product_unit_conversions_is_deleted_idx" ON "gv_inv_product_unit_conversions"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_product_unit_conversions_tenant_id_idx" ON "gv_inv_product_unit_conversions"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_inv_product_unit_conversions_tenant_id_product_id_from_u_key" ON "gv_inv_product_unit_conversions"("tenant_id", "product_id", "from_unit", "to_unit");

-- CreateIndex
CREATE INDEX "gv_inv_product_relations_is_deleted_idx" ON "gv_inv_product_relations"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_product_relations_tenant_id_idx" ON "gv_inv_product_relations"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_inv_product_relations_tenant_id_from_product_id_to_produ_key" ON "gv_inv_product_relations"("tenant_id", "from_product_id", "to_product_id", "relation_type");

-- CreateIndex
CREATE INDEX "gv_inv_product_filters_is_deleted_idx" ON "gv_inv_product_filters"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_product_filters_tenant_id_idx" ON "gv_inv_product_filters"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_inv_product_filters_tenant_id_product_id_lookup_value_id_key" ON "gv_inv_product_filters"("tenant_id", "product_id", "lookup_value_id");

-- CreateIndex
CREATE INDEX "gv_inv_items_is_deleted_idx" ON "gv_inv_items"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_items_tenant_id_inventory_type_idx" ON "gv_inv_items"("tenant_id", "inventory_type");

-- CreateIndex
CREATE INDEX "gv_inv_items_tenant_id_is_raw_material_idx" ON "gv_inv_items"("tenant_id", "is_raw_material");

-- CreateIndex
CREATE UNIQUE INDEX "gv_inv_items_tenant_id_product_id_key" ON "gv_inv_items"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "gv_inv_stock_locations_is_deleted_idx" ON "gv_inv_stock_locations"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_stock_locations_tenant_id_idx" ON "gv_inv_stock_locations"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_inv_stock_locations_tenant_id_code_key" ON "gv_inv_stock_locations"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "gv_inv_stock_transactions_is_deleted_idx" ON "gv_inv_stock_transactions"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_stock_transactions_tenant_id_product_id_transaction__idx" ON "gv_inv_stock_transactions"("tenant_id", "product_id", "transaction_date");

-- CreateIndex
CREATE INDEX "gv_inv_stock_transactions_tenant_id_transaction_type_idx" ON "gv_inv_stock_transactions"("tenant_id", "transaction_type");

-- CreateIndex
CREATE INDEX "gv_inv_stock_summaries_is_deleted_idx" ON "gv_inv_stock_summaries"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_stock_summaries_tenant_id_idx" ON "gv_inv_stock_summaries"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_inv_stock_summaries_tenant_id_product_id_location_id_key" ON "gv_inv_stock_summaries"("tenant_id", "product_id", "location_id");

-- CreateIndex
CREATE INDEX "gv_inv_stock_adjustments_is_deleted_idx" ON "gv_inv_stock_adjustments"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_stock_adjustments_tenant_id_idx" ON "gv_inv_stock_adjustments"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_inv_stock_adjustments_tenant_id_status_idx" ON "gv_inv_stock_adjustments"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "gv_inv_serial_masters_is_deleted_idx" ON "gv_inv_serial_masters"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_serial_masters_tenant_id_status_idx" ON "gv_inv_serial_masters"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "gv_inv_serial_masters_tenant_id_product_id_idx" ON "gv_inv_serial_masters"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "gv_inv_serial_masters_tenant_id_expiry_date_idx" ON "gv_inv_serial_masters"("tenant_id", "expiry_date");

-- CreateIndex
CREATE UNIQUE INDEX "gv_inv_serial_masters_tenant_id_serial_no_key" ON "gv_inv_serial_masters"("tenant_id", "serial_no");

-- CreateIndex
CREATE INDEX "gv_inv_bom_formulas_is_deleted_idx" ON "gv_inv_bom_formulas"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_bom_formulas_tenant_id_idx" ON "gv_inv_bom_formulas"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_inv_bom_formulas_tenant_id_formula_code_key" ON "gv_inv_bom_formulas"("tenant_id", "formula_code");

-- CreateIndex
CREATE INDEX "gv_inv_bom_formula_items_is_deleted_idx" ON "gv_inv_bom_formula_items"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_bom_formula_items_tenant_id_idx" ON "gv_inv_bom_formula_items"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_inv_bom_productions_is_deleted_idx" ON "gv_inv_bom_productions"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_bom_productions_tenant_id_idx" ON "gv_inv_bom_productions"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_inv_scrap_records_is_deleted_idx" ON "gv_inv_scrap_records"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_scrap_records_tenant_id_scrap_type_idx" ON "gv_inv_scrap_records"("tenant_id", "scrap_type");

-- CreateIndex
CREATE UNIQUE INDEX "gv_inv_labels_industry_code_key" ON "gv_inv_labels"("industry_code");

-- CreateIndex
CREATE INDEX "gv_inv_unit_masters_is_deleted_idx" ON "gv_inv_unit_masters"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_unit_masters_tenant_id_idx" ON "gv_inv_unit_masters"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_inv_unit_masters_tenant_id_symbol_key" ON "gv_inv_unit_masters"("tenant_id", "symbol");

-- CreateIndex
CREATE INDEX "gv_inv_unit_conversions_is_deleted_idx" ON "gv_inv_unit_conversions"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_unit_conversions_tenant_id_idx" ON "gv_inv_unit_conversions"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_inv_unit_conversions_tenant_id_from_unit_id_to_unit_id_p_key" ON "gv_inv_unit_conversions"("tenant_id", "from_unit_id", "to_unit_id", "product_id");

-- CreateIndex
CREATE INDEX "gv_inv_purchase_rfqs_tenant_id_idx" ON "gv_inv_purchase_rfqs"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_inv_purchase_rfqs_tenant_id_status_idx" ON "gv_inv_purchase_rfqs"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "gv_inv_purchase_rfqs_tenant_id_rfq_number_key" ON "gv_inv_purchase_rfqs"("tenant_id", "rfq_number");

-- CreateIndex
CREATE INDEX "gv_inv_purchase_rfq_items_is_deleted_idx" ON "gv_inv_purchase_rfq_items"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_purchase_rfq_items_tenant_id_idx" ON "gv_inv_purchase_rfq_items"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_inv_purchase_rfq_items_rfq_id_idx" ON "gv_inv_purchase_rfq_items"("rfq_id");

-- CreateIndex
CREATE INDEX "gv_inv_purchase_quotations_tenant_id_idx" ON "gv_inv_purchase_quotations"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_inv_purchase_quotations_tenant_id_status_idx" ON "gv_inv_purchase_quotations"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "gv_inv_purchase_quotations_tenant_id_quotation_number_key" ON "gv_inv_purchase_quotations"("tenant_id", "quotation_number");

-- CreateIndex
CREATE INDEX "gv_inv_purchase_quotation_items_is_deleted_idx" ON "gv_inv_purchase_quotation_items"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_purchase_quotation_items_tenant_id_idx" ON "gv_inv_purchase_quotation_items"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_inv_purchase_quotation_items_quotation_id_idx" ON "gv_inv_purchase_quotation_items"("quotation_id");

-- CreateIndex
CREATE INDEX "gv_inv_quotation_comparisons_is_deleted_idx" ON "gv_inv_quotation_comparisons"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_quotation_comparisons_tenant_id_idx" ON "gv_inv_quotation_comparisons"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_inv_purchase_orders_tenant_id_idx" ON "gv_inv_purchase_orders"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_inv_purchase_orders_tenant_id_status_idx" ON "gv_inv_purchase_orders"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "gv_inv_purchase_orders_tenant_id_po_number_key" ON "gv_inv_purchase_orders"("tenant_id", "po_number");

-- CreateIndex
CREATE INDEX "gv_inv_purchase_order_items_is_deleted_idx" ON "gv_inv_purchase_order_items"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_purchase_order_items_tenant_id_idx" ON "gv_inv_purchase_order_items"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_inv_purchase_order_items_po_id_idx" ON "gv_inv_purchase_order_items"("po_id");

-- CreateIndex
CREATE INDEX "gv_inv_goods_receipts_tenant_id_idx" ON "gv_inv_goods_receipts"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_inv_goods_receipts_tenant_id_status_idx" ON "gv_inv_goods_receipts"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "gv_inv_goods_receipts_tenant_id_receipt_number_key" ON "gv_inv_goods_receipts"("tenant_id", "receipt_number");

-- CreateIndex
CREATE INDEX "gv_inv_goods_receipt_items_is_deleted_idx" ON "gv_inv_goods_receipt_items"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_goods_receipt_items_tenant_id_idx" ON "gv_inv_goods_receipt_items"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_inv_goods_receipt_items_receipt_id_idx" ON "gv_inv_goods_receipt_items"("receipt_id");

-- CreateIndex
CREATE INDEX "gv_inv_purchase_masters_is_deleted_idx" ON "gv_inv_purchase_masters"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_inv_purchase_masters_tenant_id_idx" ON "gv_inv_purchase_masters"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_inv_purchase_masters_tenant_id_code_key" ON "gv_inv_purchase_masters"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "gv_not_reminders_is_deleted_idx" ON "gv_not_reminders"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_not_reminders_scheduled_at_is_sent_idx" ON "gv_not_reminders"("scheduled_at", "is_sent");

-- CreateIndex
CREATE INDEX "gv_not_reminders_recipient_id_is_sent_idx" ON "gv_not_reminders"("recipient_id", "is_sent");

-- CreateIndex
CREATE INDEX "gv_not_reminders_tenant_id_recipient_id_status_idx" ON "gv_not_reminders"("tenant_id", "recipient_id", "status");

-- CreateIndex
CREATE INDEX "gv_not_reminders_tenant_id_scheduled_at_status_idx" ON "gv_not_reminders"("tenant_id", "scheduled_at", "status");

-- CreateIndex
CREATE INDEX "gv_not_reminders_entity_type_entity_id_idx" ON "gv_not_reminders"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "gv_not_reminders_task_id_idx" ON "gv_not_reminders"("task_id");

-- CreateIndex
CREATE INDEX "gv_not_reminders_tenant_id_idx" ON "gv_not_reminders"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_not_notifications_is_deleted_idx" ON "gv_not_notifications"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_not_notifications_recipient_id_status_idx" ON "gv_not_notifications"("recipient_id", "status");

-- CreateIndex
CREATE INDEX "gv_not_notifications_recipient_id_category_idx" ON "gv_not_notifications"("recipient_id", "category");

-- CreateIndex
CREATE INDEX "gv_not_notifications_recipient_id_created_at_idx" ON "gv_not_notifications"("recipient_id", "created_at");

-- CreateIndex
CREATE INDEX "gv_not_notifications_tenant_id_event_type_idx" ON "gv_not_notifications"("tenant_id", "event_type");

-- CreateIndex
CREATE INDEX "gv_not_notifications_tenant_id_entity_type_entity_id_idx" ON "gv_not_notifications"("tenant_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "gv_not_notifications_group_key_idx" ON "gv_not_notifications"("group_key");

-- CreateIndex
CREATE INDEX "gv_not_notifications_tenant_id_idx" ON "gv_not_notifications"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_not_preferences_user_id_key" ON "gv_not_preferences"("user_id");

-- CreateIndex
CREATE INDEX "gv_not_preferences_is_deleted_idx" ON "gv_not_preferences"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_not_preferences_tenant_id_idx" ON "gv_not_preferences"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_not_preferences_tenant_id_user_id_key" ON "gv_not_preferences"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "gv_not_templates_is_deleted_idx" ON "gv_not_templates"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_not_templates_tenant_id_idx" ON "gv_not_templates"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_not_templates_tenant_id_name_key" ON "gv_not_templates"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "gv_not_templates_tenant_id_code_channel_key" ON "gv_not_templates"("tenant_id", "code", "channel");

-- CreateIndex
CREATE INDEX "gv_not_push_subscriptions_is_deleted_idx" ON "gv_not_push_subscriptions"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_not_push_subscriptions_user_id_idx" ON "gv_not_push_subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "gv_not_push_subscriptions_tenant_id_idx" ON "gv_not_push_subscriptions"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_not_configs_is_deleted_idx" ON "gv_not_configs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_not_configs_tenant_id_idx" ON "gv_not_configs"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_not_configs_tenant_id_event_category_idx" ON "gv_not_configs"("tenant_id", "event_category");

-- CreateIndex
CREATE UNIQUE INDEX "gv_not_configs_tenant_id_event_code_key" ON "gv_not_configs"("tenant_id", "event_code");

-- CreateIndex
CREATE INDEX "gv_not_escalation_rules_is_deleted_idx" ON "gv_not_escalation_rules"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_not_escalation_rules_tenant_id_entity_type_idx" ON "gv_not_escalation_rules"("tenant_id", "entity_type");

-- CreateIndex
CREATE INDEX "gv_not_escalation_rules_tenant_id_trigger_event_type_idx" ON "gv_not_escalation_rules"("tenant_id", "trigger_event_type");

-- CreateIndex
CREATE INDEX "gv_pay_payments_is_deleted_idx" ON "gv_pay_payments"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_pay_payments_tenant_id_invoice_id_idx" ON "gv_pay_payments"("tenant_id", "invoice_id");

-- CreateIndex
CREATE INDEX "gv_pay_payments_tenant_id_status_idx" ON "gv_pay_payments"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "gv_pay_payments_gateway_payment_id_idx" ON "gv_pay_payments"("gateway_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_pay_payments_tenant_id_payment_no_key" ON "gv_pay_payments"("tenant_id", "payment_no");

-- CreateIndex
CREATE UNIQUE INDEX "gv_pay_payment_receipts_payment_id_key" ON "gv_pay_payment_receipts"("payment_id");

-- CreateIndex
CREATE INDEX "gv_pay_payment_receipts_tenant_id_idx" ON "gv_pay_payment_receipts"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_pay_payment_receipts_tenant_id_receipt_no_key" ON "gv_pay_payment_receipts"("tenant_id", "receipt_no");

-- CreateIndex
CREATE INDEX "gv_pay_refunds_is_deleted_idx" ON "gv_pay_refunds"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_pay_refunds_tenant_id_payment_id_idx" ON "gv_pay_refunds"("tenant_id", "payment_id");

-- CreateIndex
CREATE INDEX "gv_pay_refunds_tenant_id_status_idx" ON "gv_pay_refunds"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "gv_pay_refunds_tenant_id_refund_no_key" ON "gv_pay_refunds"("tenant_id", "refund_no");

-- CreateIndex
CREATE INDEX "gv_pay_payment_reminders_is_deleted_idx" ON "gv_pay_payment_reminders"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_pay_payment_reminders_tenant_id_invoice_id_idx" ON "gv_pay_payment_reminders"("tenant_id", "invoice_id");

-- CreateIndex
CREATE INDEX "gv_pay_payment_reminders_tenant_id_is_sent_scheduled_at_idx" ON "gv_pay_payment_reminders"("tenant_id", "is_sent", "scheduled_at");

-- CreateIndex
CREATE INDEX "gv_pay_records_is_deleted_idx" ON "gv_pay_records"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_pay_records_tenant_id_payment_type_payment_date_idx" ON "gv_pay_records"("tenant_id", "payment_type", "payment_date");

-- CreateIndex
CREATE INDEX "gv_pay_records_tenant_id_entity_id_idx" ON "gv_pay_records"("tenant_id", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_pay_records_tenant_id_payment_number_key" ON "gv_pay_records"("tenant_id", "payment_number");

-- CreateIndex
CREATE INDEX "gv_rpt_export_logs_is_deleted_idx" ON "gv_rpt_export_logs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_rpt_export_logs_exported_by_id_created_at_idx" ON "gv_rpt_export_logs"("exported_by_id", "created_at");

-- CreateIndex
CREATE INDEX "gv_rpt_export_logs_report_code_created_at_idx" ON "gv_rpt_export_logs"("report_code", "created_at");

-- CreateIndex
CREATE INDEX "gv_rpt_export_logs_tenant_id_idx" ON "gv_rpt_export_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_rpt_definitions_is_deleted_idx" ON "gv_rpt_definitions"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_rpt_definitions_category_is_active_idx" ON "gv_rpt_definitions"("category", "is_active");

-- CreateIndex
CREATE INDEX "gv_rpt_definitions_tenant_id_idx" ON "gv_rpt_definitions"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_rpt_definitions_tenant_id_code_key" ON "gv_rpt_definitions"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "gv_rpt_bookmarks_is_deleted_idx" ON "gv_rpt_bookmarks"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_rpt_bookmarks_user_id_idx" ON "gv_rpt_bookmarks"("user_id");

-- CreateIndex
CREATE INDEX "gv_rpt_bookmarks_tenant_id_idx" ON "gv_rpt_bookmarks"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_rpt_scheduled_reports_is_deleted_idx" ON "gv_rpt_scheduled_reports"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_rpt_scheduled_reports_status_next_scheduled_at_idx" ON "gv_rpt_scheduled_reports"("status", "next_scheduled_at");

-- CreateIndex
CREATE INDEX "gv_rpt_scheduled_reports_tenant_id_idx" ON "gv_rpt_scheduled_reports"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_rpt_templates_is_deleted_idx" ON "gv_rpt_templates"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_rpt_templates_tenant_id_idx" ON "gv_rpt_templates"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_rpt_templates_created_by_id_idx" ON "gv_rpt_templates"("created_by_id");

-- CreateIndex
CREATE INDEX "gv_rpt_templates_industry_code_idx" ON "gv_rpt_templates"("industry_code");

-- CreateIndex
CREATE INDEX "gv_sal_quotations_lead_id_status_idx" ON "gv_sal_quotations"("lead_id", "status");

-- CreateIndex
CREATE INDEX "gv_sal_quotations_status_created_at_idx" ON "gv_sal_quotations"("status", "created_at");

-- CreateIndex
CREATE INDEX "gv_sal_quotations_contact_person_id_idx" ON "gv_sal_quotations"("contact_person_id");

-- CreateIndex
CREATE INDEX "gv_sal_quotations_organization_id_idx" ON "gv_sal_quotations"("organization_id");

-- CreateIndex
CREATE INDEX "gv_sal_quotations_created_by_id_status_idx" ON "gv_sal_quotations"("created_by_id", "status");

-- CreateIndex
CREATE INDEX "gv_sal_quotations_tenant_id_idx" ON "gv_sal_quotations"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_sal_quotations_tenant_id_quotation_no_key" ON "gv_sal_quotations"("tenant_id", "quotation_no");

-- CreateIndex
CREATE INDEX "gv_sal_quotation_line_items_is_deleted_idx" ON "gv_sal_quotation_line_items"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_sal_quotation_line_items_quotation_id_idx" ON "gv_sal_quotation_line_items"("quotation_id");

-- CreateIndex
CREATE INDEX "gv_sal_quotation_line_items_tenant_id_idx" ON "gv_sal_quotation_line_items"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_sal_quotation_send_logs_is_deleted_idx" ON "gv_sal_quotation_send_logs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_sal_quotation_send_logs_quotation_id_idx" ON "gv_sal_quotation_send_logs"("quotation_id");

-- CreateIndex
CREATE INDEX "gv_sal_quotation_send_logs_sent_by_id_idx" ON "gv_sal_quotation_send_logs"("sent_by_id");

-- CreateIndex
CREATE INDEX "gv_sal_quotation_send_logs_tenant_id_idx" ON "gv_sal_quotation_send_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_sal_quotation_negotiation_logs_is_deleted_idx" ON "gv_sal_quotation_negotiation_logs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_sal_quotation_negotiation_logs_quotation_id_logged_at_idx" ON "gv_sal_quotation_negotiation_logs"("quotation_id", "logged_at");

-- CreateIndex
CREATE INDEX "gv_sal_quotation_negotiation_logs_tenant_id_idx" ON "gv_sal_quotation_negotiation_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_sal_quotation_activities_is_deleted_idx" ON "gv_sal_quotation_activities"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_sal_quotation_activities_quotation_id_created_at_idx" ON "gv_sal_quotation_activities"("quotation_id", "created_at");

-- CreateIndex
CREATE INDEX "gv_sal_quotation_activities_tenant_id_idx" ON "gv_sal_quotation_activities"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_sal_quotation_templates_is_deleted_idx" ON "gv_sal_quotation_templates"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_sal_quotation_templates_tenant_id_idx" ON "gv_sal_quotation_templates"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_sal_quotation_templates_tenant_id_name_key" ON "gv_sal_quotation_templates"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "gv_sal_targets_is_deleted_idx" ON "gv_sal_targets"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_sal_targets_user_id_metric_period_idx" ON "gv_sal_targets"("user_id", "metric", "period");

-- CreateIndex
CREATE INDEX "gv_sal_targets_period_start_period_end_idx" ON "gv_sal_targets"("period_start", "period_end");

-- CreateIndex
CREATE INDEX "gv_sal_targets_tenant_id_idx" ON "gv_sal_targets"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_sal_service_rates_service_key_key" ON "gv_sal_service_rates"("service_key");

-- CreateIndex
CREATE INDEX "gv_sal_orders_tenant_id_customer_id_status_idx" ON "gv_sal_orders"("tenant_id", "customer_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "gv_sal_orders_tenant_id_order_number_key" ON "gv_sal_orders"("tenant_id", "order_number");

-- CreateIndex
CREATE INDEX "gv_sal_order_items_is_deleted_idx" ON "gv_sal_order_items"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_sal_order_items_tenant_id_idx" ON "gv_sal_order_items"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_sal_delivery_challans_tenant_id_customer_id_idx" ON "gv_sal_delivery_challans"("tenant_id", "customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_sal_delivery_challans_tenant_id_challan_number_key" ON "gv_sal_delivery_challans"("tenant_id", "challan_number");

-- CreateIndex
CREATE INDEX "gv_sal_delivery_challan_items_is_deleted_idx" ON "gv_sal_delivery_challan_items"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_sal_delivery_challan_items_tenant_id_idx" ON "gv_sal_delivery_challan_items"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_sal_returns_tenant_id_idx" ON "gv_sal_returns"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_sal_returns_tenant_id_status_idx" ON "gv_sal_returns"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "gv_sal_returns_tenant_id_return_number_key" ON "gv_sal_returns"("tenant_id", "return_number");

-- CreateIndex
CREATE INDEX "gv_sal_return_items_is_deleted_idx" ON "gv_sal_return_items"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_sal_return_items_tenant_id_idx" ON "gv_sal_return_items"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_sal_return_items_return_id_idx" ON "gv_sal_return_items"("return_id");

-- CreateIndex
CREATE INDEX "gv_sal_masters_tenant_id_idx" ON "gv_sal_masters"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_sal_masters_tenant_id_code_key" ON "gv_sal_masters"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "gv_sal_price_lists_tenant_id_idx" ON "gv_sal_price_lists"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_sal_price_lists_tenant_id_is_active_idx" ON "gv_sal_price_lists"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "gv_sal_price_lists_is_deleted_idx" ON "gv_sal_price_lists"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_sal_price_list_items_price_list_id_idx" ON "gv_sal_price_list_items"("price_list_id");

-- CreateIndex
CREATE INDEX "gv_sal_price_list_items_product_id_idx" ON "gv_sal_price_list_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_sal_price_list_items_price_list_id_product_id_min_quanti_key" ON "gv_sal_price_list_items"("price_list_id", "product_id", "min_quantity");

-- CreateIndex
CREATE INDEX "gv_tax_gst_verification_logs_is_deleted_idx" ON "gv_tax_gst_verification_logs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_tax_gst_verification_logs_tenant_id_user_id_idx" ON "gv_tax_gst_verification_logs"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "gv_tax_gst_verification_logs_gst_number_idx" ON "gv_tax_gst_verification_logs"("gst_number");

-- CreateIndex
CREATE INDEX "gv_tax_gst_returns_is_deleted_idx" ON "gv_tax_gst_returns"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_tax_gst_returns_tenant_id_idx" ON "gv_tax_gst_returns"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_tax_gst_returns_tenant_id_status_idx" ON "gv_tax_gst_returns"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "gv_tax_gst_returns_tenant_id_return_type_period_key" ON "gv_tax_gst_returns"("tenant_id", "return_type", "period");

-- CreateIndex
CREATE INDEX "gv_tax_tds_records_is_deleted_idx" ON "gv_tax_tds_records"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_tax_tds_records_tenant_id_section_financial_year_idx" ON "gv_tax_tds_records"("tenant_id", "section", "financial_year");

-- CreateIndex
CREATE INDEX "gv_wf_approval_requests_is_deleted_idx" ON "gv_wf_approval_requests"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_wf_approval_requests_status_idx" ON "gv_wf_approval_requests"("status");

-- CreateIndex
CREATE INDEX "gv_wf_approval_requests_maker_id_idx" ON "gv_wf_approval_requests"("maker_id");

-- CreateIndex
CREATE INDEX "gv_wf_approval_requests_checker_role_status_idx" ON "gv_wf_approval_requests"("checker_role", "status");

-- CreateIndex
CREATE INDEX "gv_wf_approval_requests_tenant_id_idx" ON "gv_wf_approval_requests"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_wf_approval_rules_is_deleted_idx" ON "gv_wf_approval_rules"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_wf_approval_rules_tenant_id_idx" ON "gv_wf_approval_rules"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_wf_approval_rules_tenant_id_entity_type_action_key" ON "gv_wf_approval_rules"("tenant_id", "entity_type", "action");

-- CreateIndex
CREATE INDEX "gv_wf_workflows_is_deleted_idx" ON "gv_wf_workflows"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_wf_workflows_entity_type_is_default_idx" ON "gv_wf_workflows"("entity_type", "is_default");

-- CreateIndex
CREATE INDEX "gv_wf_workflows_tenant_id_idx" ON "gv_wf_workflows"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_wf_workflows_tenant_id_code_key" ON "gv_wf_workflows"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "gv_wf_states_is_deleted_idx" ON "gv_wf_states"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_wf_states_workflow_id_state_type_idx" ON "gv_wf_states"("workflow_id", "state_type");

-- CreateIndex
CREATE INDEX "gv_wf_states_tenant_id_idx" ON "gv_wf_states"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_wf_states_tenant_id_workflow_id_code_key" ON "gv_wf_states"("tenant_id", "workflow_id", "code");

-- CreateIndex
CREATE INDEX "gv_wf_transitions_is_deleted_idx" ON "gv_wf_transitions"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_wf_transitions_workflow_id_from_state_id_idx" ON "gv_wf_transitions"("workflow_id", "from_state_id");

-- CreateIndex
CREATE INDEX "gv_wf_transitions_tenant_id_idx" ON "gv_wf_transitions"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_wf_transitions_tenant_id_workflow_id_code_key" ON "gv_wf_transitions"("tenant_id", "workflow_id", "code");

-- CreateIndex
CREATE INDEX "gv_wf_instances_is_deleted_idx" ON "gv_wf_instances"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_wf_instances_entity_type_entity_id_idx" ON "gv_wf_instances"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "gv_wf_instances_workflow_id_current_state_id_idx" ON "gv_wf_instances"("workflow_id", "current_state_id");

-- CreateIndex
CREATE INDEX "gv_wf_instances_is_active_current_state_id_idx" ON "gv_wf_instances"("is_active", "current_state_id");

-- CreateIndex
CREATE INDEX "gv_wf_instances_tenant_id_idx" ON "gv_wf_instances"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gv_wf_instances_tenant_id_entity_type_entity_id_workflow_id_key" ON "gv_wf_instances"("tenant_id", "entity_type", "entity_id", "workflow_id");

-- CreateIndex
CREATE INDEX "gv_wf_history_is_deleted_idx" ON "gv_wf_history"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_wf_history_instance_id_created_at_idx" ON "gv_wf_history"("instance_id", "created_at");

-- CreateIndex
CREATE INDEX "gv_wf_history_tenant_id_idx" ON "gv_wf_history"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_wf_approvals_is_deleted_idx" ON "gv_wf_approvals"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_wf_approvals_instance_id_status_idx" ON "gv_wf_approvals"("instance_id", "status");

-- CreateIndex
CREATE INDEX "gv_wf_approvals_requested_by_id_idx" ON "gv_wf_approvals"("requested_by_id");

-- CreateIndex
CREATE INDEX "gv_wf_approvals_tenant_id_idx" ON "gv_wf_approvals"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_wf_action_logs_is_deleted_idx" ON "gv_wf_action_logs"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_wf_action_logs_instance_id_action_type_idx" ON "gv_wf_action_logs"("instance_id", "action_type");

-- CreateIndex
CREATE INDEX "gv_wf_action_logs_tenant_id_idx" ON "gv_wf_action_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "gv_wf_sla_escalations_is_deleted_idx" ON "gv_wf_sla_escalations"("is_deleted");

-- CreateIndex
CREATE INDEX "gv_wf_sla_escalations_instance_id_is_resolved_idx" ON "gv_wf_sla_escalations"("instance_id", "is_resolved");

-- CreateIndex
CREATE INDEX "gv_wf_sla_escalations_tenant_id_idx" ON "gv_wf_sla_escalations"("tenant_id");

-- AddForeignKey
ALTER TABLE "gv_acc_invoices" ADD CONSTRAINT "gv_acc_invoices_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "gv_sal_quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_acc_invoices" ADD CONSTRAINT "gv_acc_invoices_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "gv_crm_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_acc_invoices" ADD CONSTRAINT "gv_acc_invoices_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "gv_crm_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_acc_invoices" ADD CONSTRAINT "gv_acc_invoices_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "gv_crm_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_acc_invoice_line_items" ADD CONSTRAINT "gv_acc_invoice_line_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "gv_acc_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_acc_proforma_invoices" ADD CONSTRAINT "gv_acc_proforma_invoices_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "gv_sal_quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_acc_proforma_invoices" ADD CONSTRAINT "gv_acc_proforma_invoices_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "gv_crm_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_acc_proforma_invoices" ADD CONSTRAINT "gv_acc_proforma_invoices_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "gv_crm_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_acc_proforma_invoices" ADD CONSTRAINT "gv_acc_proforma_invoices_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "gv_crm_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_acc_proforma_invoices" ADD CONSTRAINT "gv_acc_proforma_invoices_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "gv_acc_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_acc_proforma_line_items" ADD CONSTRAINT "gv_acc_proforma_line_items_proforma_invoice_id_fkey" FOREIGN KEY ("proforma_invoice_id") REFERENCES "gv_acc_proforma_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_acc_credit_notes" ADD CONSTRAINT "gv_acc_credit_notes_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "gv_acc_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_acc_purchase_invoices" ADD CONSTRAINT "gv_acc_purchase_invoices_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "gv_inv_purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_acc_purchase_invoice_items" ADD CONSTRAINT "gv_acc_purchase_invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "gv_acc_purchase_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_acc_ledger_masters" ADD CONSTRAINT "gv_acc_ledger_masters_account_group_id_fkey" FOREIGN KEY ("account_group_id") REFERENCES "gv_acc_account_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_acc_ledger_mappings" ADD CONSTRAINT "gv_acc_ledger_mappings_ledger_id_fkey" FOREIGN KEY ("ledger_id") REFERENCES "gv_acc_ledger_masters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_acc_debit_note_items" ADD CONSTRAINT "gv_acc_debit_note_items_debit_note_id_fkey" FOREIGN KEY ("debit_note_id") REFERENCES "gv_acc_debit_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_acc_account_groups" ADD CONSTRAINT "gv_acc_account_groups_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "gv_acc_account_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_aud_cron_job_run_logs" ADD CONSTRAINT "gv_aud_cron_job_run_logs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "gv_cfg_cron_job_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cmn_emails" ADD CONSTRAINT "gv_cmn_emails_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "gv_cmn_email_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cmn_emails" ADD CONSTRAINT "gv_cmn_emails_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "gv_cmn_email_threads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cmn_emails" ADD CONSTRAINT "gv_cmn_emails_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "gv_cmn_email_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cmn_email_attachments" ADD CONSTRAINT "gv_cmn_email_attachments_email_id_fkey" FOREIGN KEY ("email_id") REFERENCES "gv_cmn_emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cmn_campaign_recipients" ADD CONSTRAINT "gv_cmn_campaign_recipients_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "gv_cmn_email_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cmn_email_tracking_events" ADD CONSTRAINT "gv_cmn_email_tracking_events_email_id_fkey" FOREIGN KEY ("email_id") REFERENCES "gv_cmn_emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cmn_wa_conversations" ADD CONSTRAINT "gv_cmn_wa_conversations_waba_id_fkey" FOREIGN KEY ("waba_id") REFERENCES "gv_cmn_wa_business_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cmn_wa_messages" ADD CONSTRAINT "gv_cmn_wa_messages_waba_id_fkey" FOREIGN KEY ("waba_id") REFERENCES "gv_cmn_wa_business_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cmn_wa_messages" ADD CONSTRAINT "gv_cmn_wa_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "gv_cmn_wa_conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cmn_wa_templates" ADD CONSTRAINT "gv_cmn_wa_templates_waba_id_fkey" FOREIGN KEY ("waba_id") REFERENCES "gv_cmn_wa_business_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cmn_wa_broadcasts" ADD CONSTRAINT "gv_cmn_wa_broadcasts_waba_id_fkey" FOREIGN KEY ("waba_id") REFERENCES "gv_cmn_wa_business_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cmn_wa_broadcasts" ADD CONSTRAINT "gv_cmn_wa_broadcasts_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "gv_cmn_wa_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cmn_wa_broadcast_recipients" ADD CONSTRAINT "gv_cmn_wa_broadcast_recipients_broadcast_id_fkey" FOREIGN KEY ("broadcast_id") REFERENCES "gv_cmn_wa_broadcasts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cmn_wa_chatbot_flows" ADD CONSTRAINT "gv_cmn_wa_chatbot_flows_waba_id_fkey" FOREIGN KEY ("waba_id") REFERENCES "gv_cmn_wa_business_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cmn_wa_quick_replies" ADD CONSTRAINT "gv_cmn_wa_quick_replies_waba_id_fkey" FOREIGN KEY ("waba_id") REFERENCES "gv_cmn_wa_business_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cmn_wa_opt_outs" ADD CONSTRAINT "gv_cmn_wa_opt_outs_waba_id_fkey" FOREIGN KEY ("waba_id") REFERENCES "gv_cmn_wa_business_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_brand_organizations" ADD CONSTRAINT "gv_cfg_brand_organizations_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "gv_cfg_brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_brand_organizations" ADD CONSTRAINT "gv_cfg_brand_organizations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "gv_crm_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_brand_contacts" ADD CONSTRAINT "gv_cfg_brand_contacts_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "gv_cfg_brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_brand_contacts" ADD CONSTRAINT "gv_cfg_brand_contacts_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "gv_crm_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_business_locations" ADD CONSTRAINT "gv_cfg_business_locations_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "gv_cfg_business_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_company_states" ADD CONSTRAINT "gv_cfg_company_states_company_country_id_fkey" FOREIGN KEY ("company_country_id") REFERENCES "gv_cfg_company_countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_company_cities" ADD CONSTRAINT "gv_cfg_company_cities_company_state_id_fkey" FOREIGN KEY ("company_state_id") REFERENCES "gv_cfg_company_states"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_company_pincodes" ADD CONSTRAINT "gv_cfg_company_pincodes_company_city_id_fkey" FOREIGN KEY ("company_city_id") REFERENCES "gv_cfg_company_cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_entity_config_values" ADD CONSTRAINT "gv_cfg_entity_config_values_definition_id_fkey" FOREIGN KEY ("definition_id") REFERENCES "gv_cfg_custom_field_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_sync_warning_rules" ADD CONSTRAINT "gv_cfg_sync_warning_rules_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "gv_cfg_sync_policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_webhook_deliveries" ADD CONSTRAINT "gv_cfg_webhook_deliveries_endpoint_id_fkey" FOREIGN KEY ("endpoint_id") REFERENCES "gv_cfg_webhook_endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_shortcut_user_overrides" ADD CONSTRAINT "gv_cfg_shortcut_user_overrides_shortcut_id_fkey" FOREIGN KEY ("shortcut_id") REFERENCES "gv_cfg_shortcut_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_ai_documents" ADD CONSTRAINT "gv_cfg_ai_documents_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "gv_cfg_ai_datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_ai_training_jobs" ADD CONSTRAINT "gv_cfg_ai_training_jobs_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "gv_cfg_ai_datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_ai_chat_sessions" ADD CONSTRAINT "gv_cfg_ai_chat_sessions_system_prompt_id_fkey" FOREIGN KEY ("system_prompt_id") REFERENCES "gv_cfg_ai_system_prompts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_ai_chat_messages" ADD CONSTRAINT "gv_cfg_ai_chat_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "gv_cfg_ai_chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_control_room_values" ADD CONSTRAINT "gv_cfg_control_room_values_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "gv_cfg_control_room_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_cfg_control_room_drafts" ADD CONSTRAINT "gv_cfg_control_room_drafts_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "gv_cfg_control_room_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_raw_contacts" ADD CONSTRAINT "gv_crm_raw_contacts_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "gv_crm_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_raw_contact_filters" ADD CONSTRAINT "gv_crm_raw_contact_filters_raw_contact_id_fkey" FOREIGN KEY ("raw_contact_id") REFERENCES "gv_crm_raw_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_contacts" ADD CONSTRAINT "gv_crm_contacts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "gv_crm_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_contact_filters" ADD CONSTRAINT "gv_crm_contact_filters_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "gv_crm_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_organization_filters" ADD CONSTRAINT "gv_crm_organization_filters_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "gv_crm_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_contact_organizations" ADD CONSTRAINT "gv_crm_contact_organizations_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "gv_crm_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_contact_organizations" ADD CONSTRAINT "gv_crm_contact_organizations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "gv_crm_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_communications" ADD CONSTRAINT "gv_crm_communications_raw_contact_id_fkey" FOREIGN KEY ("raw_contact_id") REFERENCES "gv_crm_raw_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_communications" ADD CONSTRAINT "gv_crm_communications_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "gv_crm_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_communications" ADD CONSTRAINT "gv_crm_communications_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "gv_crm_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_communications" ADD CONSTRAINT "gv_crm_communications_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "gv_crm_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_leads" ADD CONSTRAINT "gv_crm_leads_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "gv_crm_contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_leads" ADD CONSTRAINT "gv_crm_leads_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "gv_crm_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_lead_filters" ADD CONSTRAINT "gv_crm_lead_filters_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "gv_crm_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_activities" ADD CONSTRAINT "gv_crm_activities_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "gv_crm_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_activities" ADD CONSTRAINT "gv_crm_activities_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "gv_crm_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_demos" ADD CONSTRAINT "gv_crm_demos_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "gv_crm_leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_tour_plans" ADD CONSTRAINT "gv_crm_tour_plans_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "gv_crm_leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_manufacturer_organizations" ADD CONSTRAINT "gv_crm_manufacturer_organizations_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "gv_crm_manufacturers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_manufacturer_organizations" ADD CONSTRAINT "gv_crm_manufacturer_organizations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "gv_crm_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_manufacturer_contacts" ADD CONSTRAINT "gv_crm_manufacturer_contacts_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "gv_crm_manufacturers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_manufacturer_contacts" ADD CONSTRAINT "gv_crm_manufacturer_contacts_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "gv_crm_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_organization_locations" ADD CONSTRAINT "gv_crm_organization_locations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "gv_crm_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_organization_locations" ADD CONSTRAINT "gv_crm_organization_locations_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "gv_cfg_business_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_tour_plan_visits" ADD CONSTRAINT "gv_crm_tour_plan_visits_tour_plan_id_fkey" FOREIGN KEY ("tour_plan_id") REFERENCES "gv_crm_tour_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_tour_plan_visits" ADD CONSTRAINT "gv_crm_tour_plan_visits_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "gv_crm_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_tour_plan_visits" ADD CONSTRAINT "gv_crm_tour_plan_visits_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "gv_crm_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_tour_plan_photos" ADD CONSTRAINT "gv_crm_tour_plan_photos_tour_plan_visit_id_fkey" FOREIGN KEY ("tour_plan_visit_id") REFERENCES "gv_crm_tour_plan_visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_support_ticket_messages" ADD CONSTRAINT "gv_crm_support_ticket_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "gv_crm_support_tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_tasks" ADD CONSTRAINT "gv_crm_tasks_parent_task_id_fkey" FOREIGN KEY ("parent_task_id") REFERENCES "gv_crm_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_task_history" ADD CONSTRAINT "gv_crm_task_history_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "gv_crm_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_task_watchers" ADD CONSTRAINT "gv_crm_task_watchers_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "gv_crm_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_comments" ADD CONSTRAINT "gv_crm_comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "gv_crm_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_comments" ADD CONSTRAINT "gv_crm_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "gv_crm_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_scheduled_events" ADD CONSTRAINT "gv_crm_scheduled_events_parent_event_id_fkey" FOREIGN KEY ("parent_event_id") REFERENCES "gv_crm_scheduled_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_event_participants" ADD CONSTRAINT "gv_crm_event_participants_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "gv_crm_scheduled_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_event_history" ADD CONSTRAINT "gv_crm_event_history_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "gv_crm_scheduled_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_warranty_records" ADD CONSTRAINT "gv_crm_warranty_records_warranty_template_id_fkey" FOREIGN KEY ("warranty_template_id") REFERENCES "gv_crm_warranty_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_warranty_claims" ADD CONSTRAINT "gv_crm_warranty_claims_warranty_record_id_fkey" FOREIGN KEY ("warranty_record_id") REFERENCES "gv_crm_warranty_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_amc_contracts" ADD CONSTRAINT "gv_crm_amc_contracts_amc_plan_id_fkey" FOREIGN KEY ("amc_plan_id") REFERENCES "gv_crm_amc_plan_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_amc_schedules" ADD CONSTRAINT "gv_crm_amc_schedules_amc_contract_id_fkey" FOREIGN KEY ("amc_contract_id") REFERENCES "gv_crm_amc_contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_crm_service_charges" ADD CONSTRAINT "gv_crm_service_charges_service_visit_id_fkey" FOREIGN KEY ("service_visit_id") REFERENCES "gv_crm_service_visit_logs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_doc_import_jobs" ADD CONSTRAINT "gv_doc_import_jobs_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "gv_doc_import_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_doc_import_rows" ADD CONSTRAINT "gv_doc_import_rows_import_job_id_fkey" FOREIGN KEY ("import_job_id") REFERENCES "gv_doc_import_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_doc_documents" ADD CONSTRAINT "gv_doc_documents_parent_version_id_fkey" FOREIGN KEY ("parent_version_id") REFERENCES "gv_doc_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_doc_documents" ADD CONSTRAINT "gv_doc_documents_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "gv_doc_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_doc_attachments" ADD CONSTRAINT "gv_doc_attachments_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "gv_doc_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_doc_folders" ADD CONSTRAINT "gv_doc_folders_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "gv_doc_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_doc_share_links" ADD CONSTRAINT "gv_doc_share_links_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "gv_doc_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_doc_activities" ADD CONSTRAINT "gv_doc_activities_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "gv_doc_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_doc_tenant_template_customizations" ADD CONSTRAINT "gv_doc_tenant_template_customizations_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "gv_doc_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_products" ADD CONSTRAINT "gv_inv_products_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "gv_inv_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_products" ADD CONSTRAINT "gv_inv_products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "gv_cfg_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_products" ADD CONSTRAINT "gv_inv_products_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "gv_crm_manufacturers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_product_prices" ADD CONSTRAINT "gv_inv_product_prices_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "gv_inv_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_product_prices" ADD CONSTRAINT "gv_inv_product_prices_price_group_id_fkey" FOREIGN KEY ("price_group_id") REFERENCES "gv_inv_customer_price_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_customer_group_mappings" ADD CONSTRAINT "gv_inv_customer_group_mappings_price_group_id_fkey" FOREIGN KEY ("price_group_id") REFERENCES "gv_inv_customer_price_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_product_tax_details" ADD CONSTRAINT "gv_inv_product_tax_details_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "gv_inv_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_product_unit_conversions" ADD CONSTRAINT "gv_inv_product_unit_conversions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "gv_inv_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_product_relations" ADD CONSTRAINT "gv_inv_product_relations_from_product_id_fkey" FOREIGN KEY ("from_product_id") REFERENCES "gv_inv_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_product_relations" ADD CONSTRAINT "gv_inv_product_relations_to_product_id_fkey" FOREIGN KEY ("to_product_id") REFERENCES "gv_inv_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_product_filters" ADD CONSTRAINT "gv_inv_product_filters_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "gv_inv_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_stock_transactions" ADD CONSTRAINT "gv_inv_stock_transactions_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "gv_inv_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_stock_summaries" ADD CONSTRAINT "gv_inv_stock_summaries_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "gv_inv_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_serial_masters" ADD CONSTRAINT "gv_inv_serial_masters_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "gv_inv_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_bom_formulas" ADD CONSTRAINT "gv_inv_bom_formulas_finished_product_id_fkey" FOREIGN KEY ("finished_product_id") REFERENCES "gv_inv_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_bom_formula_items" ADD CONSTRAINT "gv_inv_bom_formula_items_formula_id_fkey" FOREIGN KEY ("formula_id") REFERENCES "gv_inv_bom_formulas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_bom_formula_items" ADD CONSTRAINT "gv_inv_bom_formula_items_raw_material_id_fkey" FOREIGN KEY ("raw_material_id") REFERENCES "gv_inv_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_bom_productions" ADD CONSTRAINT "gv_inv_bom_productions_formula_id_fkey" FOREIGN KEY ("formula_id") REFERENCES "gv_inv_bom_formulas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_purchase_rfq_items" ADD CONSTRAINT "gv_inv_purchase_rfq_items_rfq_id_fkey" FOREIGN KEY ("rfq_id") REFERENCES "gv_inv_purchase_rfqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_purchase_quotations" ADD CONSTRAINT "gv_inv_purchase_quotations_rfq_id_fkey" FOREIGN KEY ("rfq_id") REFERENCES "gv_inv_purchase_rfqs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_purchase_quotation_items" ADD CONSTRAINT "gv_inv_purchase_quotation_items_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "gv_inv_purchase_quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_purchase_order_items" ADD CONSTRAINT "gv_inv_purchase_order_items_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "gv_inv_purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_goods_receipts" ADD CONSTRAINT "gv_inv_goods_receipts_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "gv_inv_purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_inv_goods_receipt_items" ADD CONSTRAINT "gv_inv_goods_receipt_items_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "gv_inv_goods_receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_not_reminders" ADD CONSTRAINT "gv_not_reminders_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "gv_crm_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_not_configs" ADD CONSTRAINT "gv_not_configs_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "gv_not_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_pay_payments" ADD CONSTRAINT "gv_pay_payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "gv_acc_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_pay_payment_receipts" ADD CONSTRAINT "gv_pay_payment_receipts_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "gv_pay_payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_pay_refunds" ADD CONSTRAINT "gv_pay_refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "gv_pay_payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_pay_payment_reminders" ADD CONSTRAINT "gv_pay_payment_reminders_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "gv_acc_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_rpt_bookmarks" ADD CONSTRAINT "gv_rpt_bookmarks_report_def_id_fkey" FOREIGN KEY ("report_def_id") REFERENCES "gv_rpt_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_rpt_scheduled_reports" ADD CONSTRAINT "gv_rpt_scheduled_reports_report_def_id_fkey" FOREIGN KEY ("report_def_id") REFERENCES "gv_rpt_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_rpt_templates" ADD CONSTRAINT "gv_rpt_templates_report_def_id_fkey" FOREIGN KEY ("report_def_id") REFERENCES "gv_rpt_definitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_sal_quotations" ADD CONSTRAINT "gv_sal_quotations_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "gv_crm_leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_sal_quotations" ADD CONSTRAINT "gv_sal_quotations_contact_person_id_fkey" FOREIGN KEY ("contact_person_id") REFERENCES "gv_crm_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_sal_quotations" ADD CONSTRAINT "gv_sal_quotations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "gv_crm_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_sal_quotations" ADD CONSTRAINT "gv_sal_quotations_parent_quotation_id_fkey" FOREIGN KEY ("parent_quotation_id") REFERENCES "gv_sal_quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_sal_quotation_line_items" ADD CONSTRAINT "gv_sal_quotation_line_items_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "gv_sal_quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_sal_quotation_send_logs" ADD CONSTRAINT "gv_sal_quotation_send_logs_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "gv_sal_quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_sal_quotation_negotiation_logs" ADD CONSTRAINT "gv_sal_quotation_negotiation_logs_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "gv_sal_quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_sal_quotation_activities" ADD CONSTRAINT "gv_sal_quotation_activities_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "gv_sal_quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_sal_order_items" ADD CONSTRAINT "gv_sal_order_items_sale_order_id_fkey" FOREIGN KEY ("sale_order_id") REFERENCES "gv_sal_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_sal_delivery_challans" ADD CONSTRAINT "gv_sal_delivery_challans_sale_order_id_fkey" FOREIGN KEY ("sale_order_id") REFERENCES "gv_sal_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_sal_delivery_challan_items" ADD CONSTRAINT "gv_sal_delivery_challan_items_challan_id_fkey" FOREIGN KEY ("challan_id") REFERENCES "gv_sal_delivery_challans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_sal_return_items" ADD CONSTRAINT "gv_sal_return_items_return_id_fkey" FOREIGN KEY ("return_id") REFERENCES "gv_sal_returns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_sal_price_list_items" ADD CONSTRAINT "gv_sal_price_list_items_price_list_id_fkey" FOREIGN KEY ("price_list_id") REFERENCES "gv_sal_price_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_wf_states" ADD CONSTRAINT "gv_wf_states_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "gv_wf_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_wf_transitions" ADD CONSTRAINT "gv_wf_transitions_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "gv_wf_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_wf_transitions" ADD CONSTRAINT "gv_wf_transitions_from_state_id_fkey" FOREIGN KEY ("from_state_id") REFERENCES "gv_wf_states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_wf_transitions" ADD CONSTRAINT "gv_wf_transitions_to_state_id_fkey" FOREIGN KEY ("to_state_id") REFERENCES "gv_wf_states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_wf_instances" ADD CONSTRAINT "gv_wf_instances_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "gv_wf_workflows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_wf_instances" ADD CONSTRAINT "gv_wf_instances_current_state_id_fkey" FOREIGN KEY ("current_state_id") REFERENCES "gv_wf_states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_wf_instances" ADD CONSTRAINT "gv_wf_instances_previous_state_id_fkey" FOREIGN KEY ("previous_state_id") REFERENCES "gv_wf_states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_wf_history" ADD CONSTRAINT "gv_wf_history_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "gv_wf_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_wf_history" ADD CONSTRAINT "gv_wf_history_from_state_id_fkey" FOREIGN KEY ("from_state_id") REFERENCES "gv_wf_states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_wf_history" ADD CONSTRAINT "gv_wf_history_to_state_id_fkey" FOREIGN KEY ("to_state_id") REFERENCES "gv_wf_states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_wf_history" ADD CONSTRAINT "gv_wf_history_transition_id_fkey" FOREIGN KEY ("transition_id") REFERENCES "gv_wf_transitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_wf_approvals" ADD CONSTRAINT "gv_wf_approvals_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "gv_wf_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_wf_approvals" ADD CONSTRAINT "gv_wf_approvals_transition_id_fkey" FOREIGN KEY ("transition_id") REFERENCES "gv_wf_transitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_wf_action_logs" ADD CONSTRAINT "gv_wf_action_logs_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "gv_wf_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_wf_action_logs" ADD CONSTRAINT "gv_wf_action_logs_transition_id_fkey" FOREIGN KEY ("transition_id") REFERENCES "gv_wf_transitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_wf_sla_escalations" ADD CONSTRAINT "gv_wf_sla_escalations_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "gv_wf_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gv_wf_sla_escalations" ADD CONSTRAINT "gv_wf_sla_escalations_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "gv_wf_states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

