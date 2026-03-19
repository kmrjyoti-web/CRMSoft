/**
 * Auto-generated enum types from Prisma schemas.
 * Source: API/prisma/schemas/{identity,platform,working}.prisma
 * DO NOT EDIT MANUALLY — regenerate with: python3 scripts/gen-enums.py
 */

export type ActivityType = 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'WHATSAPP' | 'SMS' | 'VISIT';

export type AdjustmentStatus = 'ADJ_PENDING' | 'ADJ_APPROVED' | 'ADJ_REJECTED';

export type AiChatSessionStatus = 'ACTIVE' | 'ARCHIVED' | 'DELETED';

export type AiDatasetStatus = 'DRAFT' | 'PROCESSING' | 'READY' | 'FAILED';

export type AiModelSource = 'OLLAMA' | 'CLOUD';

export type AiModelStatus = 'AVAILABLE' | 'DOWNLOADING' | 'NOT_INSTALLED' | 'ERROR';

export type AiTrainingJobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type ApiKeyStatus = 'API_ACTIVE' | 'API_REVOKED' | 'API_EXPIRED' | 'API_SUSPENDED';

export type ApiLogLevel = 'API_INFO' | 'API_WARN' | 'API_ERROR';

export type AssignmentMethod = 'MANUAL' | 'ROUND_ROBIN' | 'RULE_BASED' | 'WORKLOAD_BALANCE' | 'ESCALATION' | 'AUTO_REVERT';

export type AssignmentRuleStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE' | 'RESTORE' | 'STATUS_CHANGE' | 'BULK_UPDATE' | 'BULK_DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT';

export type AuditEntityType = 'USER' | 'ROLE' | 'PERMISSION' | 'CONTACT' | 'ORGANIZATION' | 'LEAD' | 'ACTIVITY' | 'DEMO' | 'TOUR_PLAN' | 'QUOTATION' | 'LOOKUP_VALUE' | 'MASTER_LOOKUP' | 'ENTITY_OWNER' | 'OWNERSHIP_LOG' | 'FOLLOW_UP' | 'REMINDER' | 'RECURRENCE_RULE' | 'ASSIGNMENT_RULE' | 'SALES_TARGET' | 'NOTIFICATION' | 'QUOTATION_TEMPLATE' | 'PRODUCT' | 'INVOICE' | 'PAYMENT' | 'WORKFLOW' | 'COMMUNICATION' | 'OTHER';

export type AuditSessionStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type AvailabilityStatus = 'FREE' | 'BUSY' | 'TENTATIVE' | 'OUT_OF_OFFICE';

export type CalendarSourceType = 'TASK' | 'ACTIVITY' | 'DEMO' | 'TOUR_PLAN' | 'REMINDER' | 'FOLLOW_UP' | 'SCHEDULED_EVENT' | 'EXTERNAL_GOOGLE' | 'EXTERNAL_OUTLOOK';

export type CalendarSyncDirection = 'ONE_WAY_TO_CRM' | 'ONE_WAY_FROM_CRM' | 'TWO_WAY';

export type CalendarSyncProvider = 'GOOGLE' | 'OUTLOOK' | 'ICAL';

export type CalendarSyncStatus = 'ACTIVE' | 'PAUSED' | 'ERROR' | 'DISCONNECTED';

export type CampaignRecipientStatus = 'PENDING' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'REPLIED' | 'BOUNCED' | 'FAILED' | 'UNSUBSCRIBED';

export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'FAILED';

export type ChangeAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE';

export type CloudConnectionStatus = 'CONNECTED' | 'EXPIRED' | 'REVOKED' | 'ERROR';

export type CommentEntityType = 'LEAD' | 'CONTACT' | 'ORGANIZATION' | 'TASK' | 'ACTIVITY' | 'QUOTATION' | 'TICKET' | 'INVOICE' | 'DEMO';

export type CommentVisibility = 'PUBLIC' | 'PRIVATE';

export type CommunicationType = 'PHONE' | 'EMAIL' | 'MOBILE' | 'ADDRESS' | 'WHATSAPP';

export type ConfigCategory = 'GENERAL' | 'NUMBERING' | 'BUSINESS_HOURS' | 'LEAD_SETTINGS' | 'COMMUNICATION' | 'NOTIFICATION' | 'DISPLAY' | 'SECURITY' | 'SYNC' | 'CUSTOM';

export type ConfigValueType = 'STRING' | 'INTEGER' | 'DECIMAL' | 'BOOLEAN' | 'JSON' | 'ENUM';

export type ConflictStatus = 'PENDING' | 'AUTO_RESOLVED' | 'MANUALLY_RESOLVED' | 'SERVER_APPLIED' | 'CLIENT_APPLIED' | 'SKIPPED';

export type ConflictStrategy = 'SERVER_WINS' | 'CLIENT_WINS' | 'LATEST_WINS' | 'MERGE_FIELDS' | 'MANUAL';

export type ContactOrgRelationType = 'PRIMARY_CONTACT' | 'EMPLOYEE' | 'CONSULTANT' | 'PARTNER' | 'VENDOR' | 'DIRECTOR' | 'FOUNDER';

export type ContactSource = 'MANUAL' | 'BULK_IMPORT' | 'WEB_FORM' | 'REFERRAL' | 'API';

export type ContactType = 'RAW' | 'VALIDATED';

export type CouponType = 'FIXED_TOKENS' | 'PERCENTAGE';

export type CredentialProvider = 'GMAIL' | 'OUTLOOK' | 'SMTP' | 'WHATSAPP_BUSINESS' | 'RAZORPAY' | 'STRIPE' | 'AWS_S3' | 'MINIO' | 'GOOGLE_DRIVE' | 'ONEDRIVE' | 'DROPBOX' | 'GOOGLE_MAPS' | 'EXOTEL' | 'KNOWLARITY' | 'TWILIO' | 'FIREBASE' | 'SENDGRID' | 'MAILGUN' | 'CUSTOM' | 'ANTHROPIC_CLAUDE' | 'OPENAI_GPT' | 'GOOGLE_GEMINI' | 'GROQ';

export type CredentialStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'ERROR' | 'PENDING_SETUP' | 'REVOKED';

export type CredentialValidationStatus = 'NOT_SET' | 'VALID' | 'INVALID';

export type CreditNoteStatus = 'CN_DRAFT' | 'CN_ISSUED' | 'CN_APPLIED' | 'CN_CANCELLED';

export type CronAlertChannel = 'EMAIL' | 'IN_APP' | 'BOTH';

export type CronJobScope = 'GLOBAL' | 'TENANT';

export type CronJobStatus = 'ACTIVE' | 'PAUSED' | 'DISABLED';

export type CronRunStatus = 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'SKIPPED' | 'RUNNING';

export type DataStatus = 'COMPLETE' | 'INCOMPLETE_DATA';

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export type DbStrategy = 'SHARED' | 'DEDICATED';

export type DemoMode = 'ONLINE' | 'OFFLINE';

export type DemoResult = 'INTERESTED' | 'NOT_INTERESTED' | 'FOLLOW_UP' | 'NO_SHOW';

export type DemoStatus = 'SCHEDULED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type DeviceStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'FLUSH_PENDING';

export type DigestFrequency = 'REALTIME' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'NONE';

export type DiscountType = 'PERCENT' | 'FLAT_INR';

export type DocumentCategory = 'GENERAL' | 'PROPOSAL' | 'CONTRACT' | 'INVOICE' | 'QUOTATION' | 'REPORT' | 'PRESENTATION' | 'SPREADSHEET' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'OTHER';

export type DocumentStatus = 'UPLOADING' | 'ACTIVE' | 'ARCHIVED' | 'DELETED';

export type DocumentType = 'GST_INVOICE' | 'PROFORMA_INVOICE' | 'QUOTATION' | 'RECEIPT' | 'PURCHASE_ORDER' | 'SALE_CHALLAN' | 'DELIVERY_CHALLAN' | 'CREDIT_NOTE' | 'DEBIT_NOTE' | 'CUSTOMER_STATEMENT' | 'SALES_REPORT' | 'STOCK_REPORT' | 'LEDGER_REPORT' | 'CUSTOM';

export type DuplicateConfidence = 'EXACT' | 'HIGH' | 'MEDIUM' | 'LOW';

export type DuplicateStrategy = 'SKIP' | 'UPDATE' | 'CREATE_ANYWAY' | 'ASK_PER_ROW';

export type EmailAccountStatus = 'ACTIVE' | 'DISCONNECTED' | 'ERROR' | 'TOKEN_EXPIRED' | 'SYNCING';

export type EmailDirection = 'INBOUND' | 'OUTBOUND';

export type EmailPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type EmailProvider = 'GMAIL' | 'OUTLOOK' | 'IMAP_SMTP' | 'ORGANIZATION_SMTP';

export type EmailStatus = 'DRAFT' | 'QUEUED' | 'SENDING' | 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'REPLIED' | 'BOUNCED' | 'FAILED' | 'CANCELLED';

export type EngagementAction = 'EA_VIEW' | 'EA_LIKE' | 'EA_UNLIKE' | 'EA_COMMENT' | 'EA_REPLY' | 'EA_SHARE' | 'EA_SAVE' | 'EA_UNSAVE' | 'EA_CLICK' | 'EA_ENQUIRY';

export type EnquiryStatus = 'ENQ_NEW' | 'ENQ_RESPONDED' | 'ENQ_QUOTED' | 'ENQ_NEGOTIATING' | 'ENQ_CONVERTED' | 'ENQ_CLOSED' | 'ENQ_SPAM';

export type EntityLimitType = 'CONTACTS' | 'ORGANIZATIONS' | 'LEADS' | 'QUOTATIONS' | 'INVOICES' | 'PRODUCTS' | 'USERS' | 'FILE_STORAGE_MB' | 'DB_SIZE_MB' | 'MARKETPLACE_PROMOTIONS' | 'EMAIL_PER_MONTH' | 'WHATSAPP_PER_MONTH' | 'SMS_PER_MONTH' | 'API_CALLS_PER_DAY' | 'REPORTS_COUNT' | 'WORKFLOWS_COUNT' | 'CUSTOM_FIELDS_COUNT';

export type EntityType = 'RAW_CONTACT' | 'CONTACT' | 'ORGANIZATION' | 'LEAD' | 'QUOTATION' | 'TICKET' | 'PRODUCT';

export type EntityVerificationChannel = 'EMAIL' | 'MOBILE_SMS' | 'WHATSAPP';

export type EntityVerificationMode = 'OTP' | 'LINK';

export type EntityVerificationStatus = 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'FAILED' | 'REJECTED';

export type ErrorLayer = 'BE' | 'FE' | 'DB' | 'MOB';

export type ErrorSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export type EscalationAction = 'NOTIFY_MANAGER' | 'NOTIFY_ADMIN' | 'REASSIGN' | 'REASSIGN_TASK' | 'ESCALATE_UP' | 'CHANGE_PRIORITY' | 'AUTO_CLOSE' | 'CUSTOM_WEBHOOK';

export type EventStatus = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';

export type ExpiryAction = 'EXP_DEACTIVATE' | 'EXP_ARCHIVE' | 'EXP_DELETE' | 'EXP_NOTIFY_OWNER';

export type ExpiryType = 'FIXED_DATE' | 'DAYS' | 'MONTHS' | 'YEARS' | 'NEVER';

export type ExportStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type FeatureFlag = 'WHATSAPP_INTEGRATION' | 'EMAIL_INTEGRATION' | 'BULK_IMPORT' | 'BULK_EXPORT' | 'DOCUMENTS' | 'WORKFLOWS' | 'QUOTATION_AI' | 'ADVANCED_REPORTS' | 'CUSTOM_FIELDS' | 'API_ACCESS' | 'QUOTATIONS' | 'INVOICES' | 'DEMOS' | 'TOUR_PLANS' | 'ACTIVITIES' | 'INSTALLATIONS' | 'TRAININGS' | 'TICKETS' | 'AI_FEATURES' | 'WALLET';

export type FeatureType = 'PAGE' | 'WIDGET' | 'REPORT' | 'ACTION' | 'INTEGRATION';

export type FlushStatus = 'PENDING' | 'ACKNOWLEDGED' | 'EXECUTED' | 'FAILED';

export type FlushType = 'FULL' | 'ENTITY' | 'DEVICE';

export type FollowUpPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type HelpType = 'DEVELOPER' | 'USER';

export type HolidayType = 'NATIONAL' | 'REGIONAL' | 'COMPANY' | 'OPTIONAL';

export type ImportJobStatus = 'UPLOADING' | 'PARSING' | 'PARSED' | 'MAPPING' | 'MAPPED' | 'VALIDATING' | 'VALIDATED' | 'REVIEWING' | 'IMPORTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type ImportRowStatus = 'PENDING' | 'VALID' | 'INVALID' | 'DUPLICATE_EXACT' | 'DUPLICATE_FUZZY' | 'DUPLICATE_UPDATE' | 'DUPLICATE_NEW' | 'DUPLICATE_IN_FILE' | 'SKIPPED' | 'IMPORTING' | 'IMPORTED' | 'FAILED';

export type ImportTargetEntity = 'ROW_CONTACT' | 'CONTACT' | 'ORGANIZATION' | 'LEAD' | 'PRODUCT' | 'LEDGER';

export type IndustryCategory = 'SERVICES' | 'MANUFACTURING' | 'RETAIL' | 'HEALTHCARE' | 'EDUCATION' | 'FINANCE' | 'REAL_ESTATE' | 'FOOD_BEVERAGE' | 'TRAVEL' | 'CONSTRUCTION' | 'ECOMMERCE' | 'EVENTS' | 'AUTOMOTIVE' | 'OTHER';

export type InventoryTaxType = 'INV_GST' | 'INV_CESS' | 'INV_TDS' | 'INV_EXEMPT' | 'INV_ZERO_RATED';

export type InventoryType = 'SERIAL' | 'BATCH' | 'EXPIRY' | 'BOM' | 'SIMPLE';

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'VOID';

export type IpRuleType = 'WHITELIST' | 'BLACKLIST';

export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type LeadStatus = 'NEW' | 'VERIFIED' | 'ALLOCATED' | 'IN_PROGRESS' | 'DEMO_SCHEDULED' | 'QUOTATION_SENT' | 'NEGOTIATION' | 'WON' | 'LOST' | 'ON_HOLD';

export type LicenseStatus = 'LIC_ACTIVE' | 'LIC_EXPIRED' | 'LIC_SUSPENDED' | 'LIC_REVOKED';

export type LimitType = 'TOTAL' | 'MONTHLY' | 'UNLIMITED' | 'DISABLED';

export type ListingStatus = 'LST_DRAFT' | 'LST_SCHEDULED' | 'LST_ACTIVE' | 'LST_EXPIRED' | 'LST_SOLD_OUT' | 'LST_DEACTIVATED' | 'LST_ARCHIVED';

export type ListingType = 'PRODUCT' | 'SERVICE' | 'NEW_LAUNCH' | 'LAUNCHING_OFFER' | 'REQUIREMENT' | 'JOB' | 'OTHER';

export type LocationLevel = 'COUNTRY' | 'STATE' | 'CITY' | 'AREA';

export type MarketplaceInstallStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export type MarketplaceModuleStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'SUSPENDED';

export type MktOrderStatus = 'MKT_PENDING' | 'MKT_CONFIRMED' | 'MKT_PROCESSING' | 'MKT_SHIPPED' | 'MKT_DELIVERED' | 'MKT_CANCELLED' | 'MKT_RETURNED' | 'MKT_REFUNDED';

export type MktPaymentStatus = 'MPAY_PENDING' | 'MPAY_PAID' | 'MPAY_FAILED' | 'MPAY_REFUNDED' | 'MPAY_PARTIALLY_REFUNDED';

export type ModuleAccessLevel = 'MOD_DISABLED' | 'MOD_READONLY' | 'MOD_FULL';

export type ModuleCategory = 'CORE' | 'CRM' | 'SALES' | 'FINANCE' | 'POST_SALES' | 'COMMUNICATION' | 'AI' | 'REPORTS' | 'DEVELOPER' | 'WORKFLOW' | 'MARKETING' | 'OPERATIONS' | 'INTEGRATIONS' | 'MARKETPLACE' | 'ADDON' | 'ANALYTICS';

export type ModulePricingType = 'FREE' | 'INCLUDED' | 'ADDON' | 'ONE_TIME' | 'PER_USAGE';

export type ModuleStatus = 'ACTIVE' | 'BETA' | 'DEPRECATED' | 'COMING_SOON';

export type NegotiationType = 'PRICE_CHANGE' | 'ITEM_CHANGE' | 'TERM_CHANGE' | 'DISCOUNT_REQUEST' | 'COUNTER_OFFER' | 'REQUIREMENT' | 'GENERAL_NOTE';

export type NotificationCategory = 'LEAD_ASSIGNED' | 'LEAD_UPDATED' | 'OWNERSHIP_CHANGED' | 'DEMO_SCHEDULED' | 'DEMO_COMPLETED' | 'FOLLOW_UP_DUE' | 'FOLLOW_UP_OVERDUE' | 'QUOTATION_SENT' | 'QUOTATION_APPROVED' | 'TOUR_PLAN_APPROVED' | 'ACTIVITY_REMINDER' | 'DELEGATION_STARTED' | 'DELEGATION_ENDED' | 'SYSTEM_ALERT' | 'WORKFLOW_ACTION';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH' | 'WHATSAPP' | 'CALL';

export type NotificationEventCategory = 'LEAD' | 'CONTACT' | 'ACTIVITY' | 'DEMO' | 'QUOTATION' | 'TOUR_PLAN' | 'SYSTEM' | 'USER';

export type NotificationEventType = 'TASK_ASSIGNED' | 'TASK_UPDATED' | 'TASK_COMPLETED' | 'TASK_OVERDUE' | 'TASK_COMMENT' | 'TASK_COMMENT_ADDED' | 'REMINDER_DUE' | 'REMINDER_TRIGGERED' | 'REMINDER_MISSED' | 'LEAD_ASSIGNED' | 'LEAD_STATUS_CHANGED' | 'LEAD_COMMENT_ADDED' | 'LEAD_FOLLOW_UP_DUE' | 'LEAD_WON' | 'LEAD_LOST' | 'ACTIVITY_TAGGED' | 'ACTIVITY_REMINDER' | 'COMMENT_ADDED' | 'COMMENT_PRIVATE' | 'APPROVAL_REQUIRED' | 'ESCALATION_TRIGGERED' | 'SYSTEM_ALERT' | 'CUSTOM';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type NotificationStatus = 'UNREAD' | 'READ' | 'DISMISSED' | 'ARCHIVED';

export type OfferType = 'TRIAL_EXTENSION' | 'DISCOUNT_PERCENTAGE' | 'DISCOUNT_FLAT' | 'BONUS_TOKENS' | 'FREE_UPGRADE';

export type OnboardingStep = 'CREATED' | 'PROFILE_COMPLETED' | 'USERS_INVITED' | 'DATA_IMPORTED' | 'COMPLETED';

export type OrgType = 'GENERAL' | 'BRAND' | 'MANUFACTURER' | 'DISTRIBUTOR' | 'DEALER' | 'FRANCHISE';

export type OtpPurpose = 'EMAIL_VERIFICATION' | 'MOBILE_VERIFICATION' | 'PASSWORD_RESET' | 'LOGIN_OTP' | 'TRANSACTION';

export type OtpStatus = 'OTP_PENDING' | 'OTP_VERIFIED' | 'OTP_EXPIRED' | 'OTP_FAILED';

export type OwnerType = 'PRIMARY_OWNER' | 'CO_OWNER' | 'WATCHER' | 'DELEGATED_OWNER' | 'TEAM_OWNER';

export type OwnershipAction = 'ASSIGN' | 'TRANSFER' | 'REVOKE' | 'DELEGATE' | 'AUTO_REVERT' | 'ROTATION' | 'ESCALATION';

export type PatchStatus = 'PENDING' | 'APPLIED' | 'FAILED' | 'ROLLED_BACK';

export type PaymentGateway = 'RAZORPAY' | 'STRIPE' | 'MANUAL';

export type PaymentMethod = 'CASH' | 'CHEQUE' | 'BANK_TRANSFER' | 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'WALLET' | 'RAZORPAY' | 'STRIPE' | 'OTHER';

export type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export type PlanInterval = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export type PluginCategory = 'COMMUNICATION' | 'PAYMENT' | 'CALENDAR' | 'TELEPHONY' | 'STORAGE' | 'AI' | 'MARKETING' | 'ANALYTICS';

export type PluginStatus = 'PLUGIN_ACTIVE' | 'PLUGIN_INACTIVE' | 'PLUGIN_DEPRECATED' | 'PLUGIN_BETA';

export type PostStatus = 'PS_DRAFT' | 'PS_SCHEDULED' | 'PS_ACTIVE' | 'PS_EXPIRED' | 'PS_HIDDEN' | 'PS_DELETED';

export type PostType = 'PT_TEXT' | 'PT_IMAGE' | 'PT_VIDEO' | 'PT_PRODUCT_SHARE' | 'PT_JOB_POSTING' | 'PT_NEWS' | 'PT_ANNOUNCEMENT' | 'PT_POLL';

export type PriceType = 'MRP' | 'SALE_PRICE' | 'PURCHASE_PRICE' | 'DEALER_PRICE' | 'DISTRIBUTOR_PRICE' | 'SPECIAL_PRICE';

export type PriorityType = 'PRIMARY' | 'WORK' | 'HOME' | 'PERSONAL' | 'OTHER';

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'COMING_SOON';

export type ProfileStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export type ProformaInvoiceStatus = 'PI_DRAFT' | 'PI_SENT' | 'PI_ACCEPTED' | 'PI_REJECTED' | 'PI_CONVERTED' | 'PI_CANCELLED';

export type QuotationPriceType = 'FIXED' | 'RANGE' | 'NEGOTIABLE';

export type QuotationSendChannel = 'EMAIL' | 'WHATSAPP' | 'PORTAL' | 'MANUAL' | 'DOWNLOAD';

export type QuotationStatus = 'DRAFT' | 'INTERNAL_REVIEW' | 'SENT' | 'VIEWED' | 'NEGOTIATION' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'REVISED' | 'CANCELLED';

export type RSVPStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE';

export type RawContactSource = 'MANUAL' | 'BULK_IMPORT' | 'WEB_FORM' | 'REFERRAL' | 'API';

export type RawContactStatus = 'RAW' | 'VERIFIED' | 'REJECTED' | 'DUPLICATE';

export type RecurrencePattern = 'NONE' | 'DAILY' | 'WEEKDAYS' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'MONTHLY_NTH' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';

export type RefundStatus = 'REFUND_PENDING' | 'REFUND_PROCESSED' | 'REFUND_FAILED' | 'REFUND_CANCELLED';

export type RegistrationType = 'INDIVIDUAL' | 'BUSINESS';

export type ReminderChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH' | 'WHATSAPP';

export type ReminderLevel = 'GENTLE' | 'FIRM' | 'URGENT' | 'FINAL';

export type ReminderStatus = 'PENDING' | 'SENT' | 'TRIGGERED' | 'ACKNOWLEDGED' | 'SNOOZED' | 'MISSED' | 'DISMISSED' | 'CANCELLED';

export type ReminderType = 'PERSONAL' | 'TASK_LINKED' | 'ACTIVITY_LINKED' | 'FOLLOW_UP_LINKED' | 'SYSTEM' | 'ONCE' | 'RECURRING';

export type ReportCategory = 'SALES' | 'LEAD' | 'CONTACT_ORG' | 'ACTIVITY' | 'DEMO' | 'QUOTATION' | 'TOUR_PLAN' | 'TEAM' | 'COMMUNICATION' | 'EXECUTIVE' | 'CUSTOM';

export type ReportFormat = 'CSV' | 'XLSX' | 'JSON' | 'PDF';

export type ReportFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ON_DEMAND';

export type ReportType = 'LEAD_REPORT' | 'ACTIVITY_REPORT' | 'QUOTATION_REPORT' | 'DEMO_REPORT' | 'TOUR_PLAN_REPORT' | 'REVENUE_REPORT' | 'PIPELINE_REPORT' | 'TEAM_PERFORMANCE_REPORT' | 'CONVERSION_REPORT' | 'CUSTOM';

export type RetentionAction = 'ARCHIVE' | 'SOFT_DELETE' | 'HARD_DELETE' | 'ANONYMIZE';

export type RuleConditionOperator = 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'NOT_IN' | 'IS_EMPTY' | 'IS_NOT_EMPTY';

export type ScheduledEventType = 'MEETING' | 'CALL' | 'FOLLOW_UP' | 'VISIT' | 'TRAINING' | 'WEBINAR' | 'BREAK' | 'PERSONAL' | 'HOLIDAY' | 'OTHER';

export type ScheduledReportStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';

export type ScrapType = 'SCRAP_EXPIRED' | 'SCRAP_DAMAGED' | 'SCRAP_PRODUCTION_WASTE' | 'SCRAP_RETURNED_DEFECTIVE' | 'SCRAP_QUALITY_FAILURE';

export type SequenceResetPolicy = 'NEVER' | 'DAILY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export type SerialStatus = 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'EXPIRED' | 'DAMAGED' | 'RETURNED' | 'ACTIVATED' | 'DEACTIVATED';

export type ShareLinkAccess = 'VIEW' | 'DOWNLOAD' | 'EDIT';

export type StockTransactionType = 'PURCHASE_IN' | 'SALE_OUT' | 'RETURN_IN' | 'TRANSFER' | 'ADJUSTMENT' | 'OPENING_BALANCE' | 'DAMAGE' | 'WRITE_OFF' | 'PRODUCTION_IN' | 'PRODUCTION_OUT' | 'SCRAP';

export type StorageProvider = 'NONE' | 'GOOGLE_DRIVE' | 'ONEDRIVE' | 'DROPBOX';

export type StorageType = 'LOCAL' | 'S3' | 'CLOUD_LINK';

export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';

export type SyncDirection = 'BIDIRECTIONAL' | 'DOWNLOAD_ONLY' | 'UPLOAD_ONLY' | 'DISABLED';

export type SyncEnforcement = 'WARN_ONLY' | 'BLOCK_AFTER_DELAY' | 'BLOCK_UNTIL_SYNC' | 'FLUSH_AND_RESYNC';

export type SyncWarningLevel = 'INFO' | 'WARNING' | 'URGENT' | 'BLOCK';

export type SyncWarningTrigger = 'TIME_SINCE_SYNC' | 'DATA_AGE' | 'PENDING_UPLOAD_COUNT' | 'PENDING_UPLOAD_AGE' | 'STORAGE_SIZE' | 'ENTITY_SPECIFIC';

export type TargetMetric = 'LEADS_CREATED' | 'LEADS_WON' | 'REVENUE' | 'ACTIVITIES' | 'DEMOS' | 'CALLS' | 'MEETINGS' | 'VISITS' | 'QUOTATIONS_SENT' | 'QUOTATIONS_ACCEPTED';

export type TargetPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export type TaskAssignmentScope = 'SELF' | 'REPORTEES' | 'ANY_USER' | 'SPECIFIC_USER' | 'DEPARTMENT' | 'DESIGNATION' | 'ROLE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL';

export type TaskRecurrence = 'NONE' | 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD' | 'OVERDUE' | 'PENDING_APPROVAL';

export type TaskType = 'GENERAL' | 'FOLLOW_UP' | 'REMINDER' | 'ACTIVITY_LINKED' | 'APPROVAL' | 'REVIEW' | 'CALL_BACK' | 'MEETING' | 'DEMO' | 'CUSTOM';

export type TaxType = 'GST' | 'IGST' | 'EXEMPT' | 'ZERO_RATED' | 'COMPOSITE';

export type TemplateCategory = 'GENERAL' | 'FOLLOW_UP' | 'INTRODUCTION' | 'PROPOSAL' | 'QUOTATION_MAIL' | 'MEETING' | 'THANK_YOU' | 'REMINDER' | 'FEEDBACK' | 'CAMPAIGN' | 'WELCOME' | 'ANNOUNCEMENT' | 'NEWSLETTER' | 'CUSTOM';

export type TenantAuditActionType = 'PAGE_VISIT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT' | 'SETTINGS_CHANGE' | 'PERMISSION_DENIED' | 'API_CALL' | 'FILE_UPLOAD' | 'FILE_DOWNLOAD' | 'SEARCH' | 'BULK_ACTION';

export type TenantModuleStatus = 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'SUSPENDED';

export type TenantPluginStatus = 'TP_ACTIVE' | 'TP_INACTIVE' | 'TP_ERROR' | 'TP_PENDING_SETUP';

export type TenantStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TRIAL' | 'CANCELLED';

export type TicketCategory = 'BUG' | 'FEATURE_REQUEST' | 'BILLING' | 'PERFORMANCE' | 'DATA_ISSUE' | 'SECURITY' | 'OTHER';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_ON_CUSTOMER' | 'WAITING_ON_VENDOR' | 'RESOLVED' | 'CLOSED';

export type TourPlanStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type UnitCategory = 'WEIGHT' | 'VOLUME' | 'LENGTH' | 'QUANTITY' | 'AREA';

export type UnitType = 'PIECE' | 'BOX' | 'PACK' | 'CARTON' | 'KG' | 'GRAM' | 'LITRE' | 'ML' | 'METER' | 'CM' | 'SQ_FT' | 'SQ_METER' | 'DOZEN' | 'SET' | 'PAIR' | 'ROLL' | 'BUNDLE';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type UserType = 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER' | 'REFERRAL_PARTNER';

export type ValidatorType = 'REQUIRED' | 'EMAIL' | 'INDIAN_MOBILE' | 'PHONE' | 'GST_NUMBER' | 'PAN_NUMBER' | 'TAN_NUMBER' | 'AADHAAR' | 'IFSC_CODE' | 'PINCODE' | 'WEBSITE' | 'URL' | 'NUMERIC' | 'DECIMAL' | 'DATE' | 'ENUM' | 'CUSTOM_REGEX' | 'MIN_LENGTH' | 'MAX_LENGTH';

export type VendorStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED';

export type VerificationStatus = 'UNVERIFIED' | 'PARTIALLY_VERIFIED' | 'FULLY_VERIFIED';

export type VerifiedByType = 'SELF' | 'STAFF' | 'SYSTEM';

export type VersionStatus = 'DRAFT' | 'TESTING' | 'STAGED' | 'PUBLISHED' | 'ROLLED_BACK' | 'DEPRECATED';

export type VisibilityType = 'VIS_PUBLIC' | 'VIS_GEO_TARGETED' | 'VIS_VERIFIED_ONLY' | 'VIS_MY_CONTACTS' | 'VIS_SELECTED_CONTACTS' | 'VIS_CATEGORY_BASED' | 'VIS_GRADE_BASED';

export type WaBroadcastRecipientStatus = 'PENDING' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'OPTED_OUT';

export type WaBroadcastStatus = 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'FAILED';

export type WaChatbotFlowStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';

export type WaChatbotNodeType = 'WELCOME' | 'KEYWORD_TRIGGER' | 'MENU' | 'TEXT_REPLY' | 'MEDIA_REPLY' | 'QUICK_BUTTONS' | 'COLLECT_INPUT' | 'CONDITION' | 'API_CALL' | 'ASSIGN_AGENT' | 'DELAY' | 'TAG_CONTACT' | 'LINK_LEAD';

export type WaConversationStatus = 'OPEN' | 'PENDING' | 'RESOLVED' | 'EXPIRED' | 'SPAM';

export type WaMessageDirection = 'INBOUND' | 'OUTBOUND';

export type WaMessageStatus = 'PENDING' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export type WaMessageType = 'TEXT' | 'TEMPLATE' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'STICKER' | 'LOCATION' | 'CONTACT_CARD' | 'INTERACTIVE' | 'REACTION' | 'BUTTON_REPLY' | 'LIST_REPLY' | 'ORDER' | 'UNKNOWN';

export type WaTemplateCategory = 'UTILITY' | 'AUTHENTICATION' | 'MARKETING';

export type WaTemplateStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAUSED' | 'DISABLED' | 'DELETED';

export type WabaConnectionStatus = 'ACTIVE' | 'DISCONNECTED' | 'ERROR' | 'PENDING_VERIFICATION';

export type WalletTxnStatus = 'WTX_PENDING' | 'WTX_COMPLETED' | 'WTX_FAILED' | 'WTX_REVERSED';

export type WalletTxnType = 'CREDIT' | 'DEBIT' | 'REFUND' | 'PROMO' | 'ADJUSTMENT' | 'EXPIRY';

export type WebhookDeliveryStatus = 'WH_PENDING' | 'WH_DELIVERED' | 'WH_DELIVERY_FAILED' | 'WH_RETRYING';

export type WebhookStatus = 'WH_ACTIVE' | 'WH_PAUSED' | 'WH_FAILED' | 'WH_DISABLED';

export type WorkflowApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export type WorkflowStateCategory = 'SUCCESS' | 'FAILURE' | 'PAUSED';

export type WorkflowStateType = 'INITIAL' | 'INTERMEDIATE' | 'TERMINAL';

export type WorkflowTriggerType = 'MANUAL' | 'AUTO' | 'SCHEDULED' | 'APPROVAL';
