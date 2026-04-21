/**
 * MASTER ERROR CODE REGISTRY.
 * Every error in the entire application is defined here.
 *
 * NAMING CONVENTION: {ENTITY}_{PROBLEM}
 * Examples: LEAD_NOT_FOUND, AUTH_TOKEN_EXPIRED, PLAN_LIMIT_REACHED
 */

export interface ErrorCodeDefinition {
  code: string;
  httpStatus: number;
  message: string;
  suggestion: string;
}

export const ERROR_CODES: Record<string, ErrorCodeDefinition> = {

  // ═══════════════════════════════════════════════════
  // GENERIC
  // ═══════════════════════════════════════════════════
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    httpStatus: 500,
    message: 'An unexpected internal error occurred',
    suggestion: 'This is a server-side issue. Contact support with the requestId.',
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    httpStatus: 400,
    message: 'One or more fields have invalid values',
    suggestion: 'Check the details array for field-level errors and fix each one.',
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    httpStatus: 404,
    message: 'The requested resource was not found',
    suggestion: 'Verify the resource ID exists. Use the list endpoint to check.',
  },
  DUPLICATE_ENTRY: {
    code: 'DUPLICATE_ENTRY',
    httpStatus: 409,
    message: 'A record with the same unique value already exists',
    suggestion: 'Check for existing records with the same email, phone, or unique identifier.',
  },
  INVALID_STATE: {
    code: 'INVALID_STATE',
    httpStatus: 422,
    message: 'The operation is not valid for the current state of the resource',
    suggestion: 'Check the current status/state of the resource before performing this action.',
  },
  INVALID_INPUT: {
    code: 'INVALID_INPUT',
    httpStatus: 400,
    message: 'The provided input is not valid',
    suggestion: 'Review the request body and ensure all required fields are correct.',
  },
  OPERATION_FAILED: {
    code: 'OPERATION_FAILED',
    httpStatus: 500,
    message: 'The operation could not be completed',
    suggestion: 'Retry the request. If the problem persists, contact support.',
  },
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    httpStatus: 429,
    message: 'Too many requests. Rate limit exceeded.',
    suggestion: 'Wait before making more requests. Check rate limit headers.',
  },
  SERVICE_UNAVAILABLE: {
    code: 'SERVICE_UNAVAILABLE',
    httpStatus: 503,
    message: 'The service is temporarily unavailable',
    suggestion: 'Try again in a few minutes.',
  },

  // ═══════════════════════════════════════════════════
  // AUTH & ACCESS
  // ═══════════════════════════════════════════════════
  AUTH_TOKEN_MISSING: {
    code: 'AUTH_TOKEN_MISSING',
    httpStatus: 401,
    message: 'Authentication token is missing',
    suggestion: 'Include a valid Bearer token in the Authorization header.',
  },
  AUTH_TOKEN_EXPIRED: {
    code: 'AUTH_TOKEN_EXPIRED',
    httpStatus: 401,
    message: 'Authentication token has expired',
    suggestion: 'Obtain a new token via POST /auth/login.',
  },
  AUTH_TOKEN_INVALID: {
    code: 'AUTH_TOKEN_INVALID',
    httpStatus: 401,
    message: 'Authentication token is invalid or malformed',
    suggestion: 'Ensure the token is correctly formatted and not tampered with.',
  },
  AUTH_INVALID_CREDENTIALS: {
    code: 'AUTH_INVALID_CREDENTIALS',
    httpStatus: 401,
    message: 'Invalid email or password',
    suggestion: 'Check your email and password. Use POST /auth/forgot-password if needed.',
  },
  AUTH_ACCOUNT_LOCKED: {
    code: 'AUTH_ACCOUNT_LOCKED',
    httpStatus: 423,
    message: 'Account is locked due to too many failed login attempts',
    suggestion: 'Wait 30 minutes or contact your admin to unlock.',
  },
  AUTH_ACCOUNT_INACTIVE: {
    code: 'AUTH_ACCOUNT_INACTIVE',
    httpStatus: 403,
    message: 'Your account is inactive or suspended',
    suggestion: 'Contact your administrator to reactivate your account.',
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    httpStatus: 403,
    message: 'You do not have permission to perform this action',
    suggestion: 'Contact your admin to get the required role/permission.',
  },
  PERMISSION_DENIED: {
    code: 'PERMISSION_DENIED',
    httpStatus: 403,
    message: 'You lack the specific permission required for this action',
    suggestion: 'Required permission: {permission}. Ask your admin to grant it.',
  },
  ROLE_INSUFFICIENT: {
    code: 'ROLE_INSUFFICIENT',
    httpStatus: 403,
    message: 'Your role does not have access to this resource',
    suggestion: 'Required role: {role}. Contact your admin.',
  },

  // ═══════════════════════════════════════════════════
  // TENANT & SUBSCRIPTION
  // ═══════════════════════════════════════════════════
  TENANT_NOT_FOUND: {
    code: 'TENANT_NOT_FOUND',
    httpStatus: 404,
    message: 'Tenant does not exist',
    suggestion: 'Verify the tenant slug or ID. Check if the account has been created.',
  },
  TENANT_SUSPENDED: {
    code: 'TENANT_SUSPENDED',
    httpStatus: 403,
    message: 'Your organization account is suspended',
    suggestion: 'Contact billing support or clear overdue payments to reactivate.',
  },
  TENANT_TRIAL_EXPIRED: {
    code: 'TENANT_TRIAL_EXPIRED',
    httpStatus: 403,
    message: 'Your trial period has expired',
    suggestion: 'Subscribe to a paid plan to continue using the platform.',
  },
  PLAN_LIMIT_REACHED: {
    code: 'PLAN_LIMIT_REACHED',
    httpStatus: 403,
    message: 'You have reached the limit for your current plan',
    suggestion: 'Upgrade your plan or delete unused records. Current: {current}/{limit}.',
  },
  FEATURE_NOT_AVAILABLE: {
    code: 'FEATURE_NOT_AVAILABLE',
    httpStatus: 403,
    message: 'This feature is not available on your current plan',
    suggestion: 'Upgrade to a plan that includes {feature}.',
  },
  SUBSCRIPTION_EXPIRED: {
    code: 'SUBSCRIPTION_EXPIRED',
    httpStatus: 403,
    message: 'Your subscription has expired',
    suggestion: 'Renew your subscription to continue.',
  },

  // ═══════════════════════════════════════════════════
  // LEAD
  // ═══════════════════════════════════════════════════
  LEAD_NOT_FOUND: {
    code: 'LEAD_NOT_FOUND',
    httpStatus: 404,
    message: 'Lead does not exist',
    suggestion: 'Verify the lead ID. Use GET /leads to list all leads.',
  },
  LEAD_ALREADY_WON: {
    code: 'LEAD_ALREADY_WON',
    httpStatus: 422,
    message: 'This lead is already marked as WON and cannot be modified',
    suggestion: 'WON leads are locked. Create a new lead if needed.',
  },
  LEAD_ALREADY_LOST: {
    code: 'LEAD_ALREADY_LOST',
    httpStatus: 422,
    message: 'This lead is already marked as LOST',
    suggestion: 'Reopen the lead first using PUT /leads/{id}/reopen if allowed.',
  },
  LEAD_STATUS_INVALID_TRANSITION: {
    code: 'LEAD_STATUS_INVALID_TRANSITION',
    httpStatus: 422,
    message: 'Cannot transition lead from {from} to {to}',
    suggestion: 'Valid transitions from {from}: {validTransitions}. Check the lead workflow.',
  },
  LEAD_ALLOCATION_FAILED: {
    code: 'LEAD_ALLOCATION_FAILED',
    httpStatus: 422,
    message: 'Lead could not be allocated to the specified user',
    suggestion: 'Check if the user is active and has capacity. Max leads: {maxLeads}.',
  },
  LEAD_LOST_REASON_REQUIRED: {
    code: 'LEAD_LOST_REASON_REQUIRED',
    httpStatus: 400,
    message: 'A reason is required when marking a lead as LOST',
    suggestion: 'Provide lostReasonId in the request body.',
  },
  LEAD_EXPECTED_VALUE_REQUIRED: {
    code: 'LEAD_EXPECTED_VALUE_REQUIRED',
    httpStatus: 400,
    message: 'Expected value is required for this lead status',
    suggestion: 'Provide expectedValue before moving to QUOTATION_SENT or later stages.',
  },

  // ═══════════════════════════════════════════════════
  // CONTACT
  // ═══════════════════════════════════════════════════
  CONTACT_NOT_FOUND: {
    code: 'CONTACT_NOT_FOUND',
    httpStatus: 404,
    message: 'Contact does not exist',
    suggestion: 'Verify the contact ID. Use GET /contacts to search.',
  },
  CONTACT_DUPLICATE_EMAIL: {
    code: 'CONTACT_DUPLICATE_EMAIL',
    httpStatus: 409,
    message: 'A contact with this email already exists',
    suggestion: 'Use the existing contact or update their details.',
  },
  CONTACT_DUPLICATE_PHONE: {
    code: 'CONTACT_DUPLICATE_PHONE',
    httpStatus: 409,
    message: 'A contact with this phone number already exists',
    suggestion: 'Use the existing contact or update their details.',
  },

  // ═══════════════════════════════════════════════════
  // ORGANIZATION
  // ═══════════════════════════════════════════════════
  ORGANIZATION_NOT_FOUND: {
    code: 'ORGANIZATION_NOT_FOUND',
    httpStatus: 404,
    message: 'Organization does not exist',
    suggestion: 'Verify the organization ID. Use GET /organizations to search.',
  },
  ORGANIZATION_DUPLICATE_GST: {
    code: 'ORGANIZATION_DUPLICATE_GST',
    httpStatus: 409,
    message: 'An organization with this GST number already exists',
    suggestion: 'Search by GST to find the existing organization.',
  },

  // ═══════════════════════════════════════════════════
  // ACTIVITY
  // ═══════════════════════════════════════════════════
  ACTIVITY_NOT_FOUND: {
    code: 'ACTIVITY_NOT_FOUND',
    httpStatus: 404,
    message: 'Activity does not exist',
    suggestion: 'Verify the activity ID.',
  },
  ACTIVITY_ALREADY_COMPLETED: {
    code: 'ACTIVITY_ALREADY_COMPLETED',
    httpStatus: 422,
    message: 'This activity is already marked as completed',
    suggestion: 'Completed activities cannot be modified. Create a new activity if needed.',
  },

  // ═══════════════════════════════════════════════════
  // DEMO
  // ═══════════════════════════════════════════════════
  DEMO_NOT_FOUND: {
    code: 'DEMO_NOT_FOUND',
    httpStatus: 404,
    message: 'Demo does not exist',
    suggestion: 'Verify the demo ID. Use GET /demos to list.',
  },
  DEMO_ALREADY_COMPLETED: {
    code: 'DEMO_ALREADY_COMPLETED',
    httpStatus: 422,
    message: 'This demo is already completed and cannot be rescheduled',
    suggestion: 'Schedule a new demo instead.',
  },
  DEMO_TIME_CONFLICT: {
    code: 'DEMO_TIME_CONFLICT',
    httpStatus: 409,
    message: 'A demo is already scheduled at this time for this user',
    suggestion: 'Choose a different time slot. Check GET /demos/calendar for availability.',
  },

  // ═══════════════════════════════════════════════════
  // QUOTATION
  // ═══════════════════════════════════════════════════
  QUOTATION_NOT_FOUND: {
    code: 'QUOTATION_NOT_FOUND',
    httpStatus: 404,
    message: 'Quotation does not exist',
    suggestion: 'Verify the quotation ID.',
  },
  QUOTATION_ALREADY_SENT: {
    code: 'QUOTATION_ALREADY_SENT',
    httpStatus: 422,
    message: 'This quotation has already been sent and cannot be edited',
    suggestion: 'Create a revision using POST /quotations/{id}/revise.',
  },
  QUOTATION_EXPIRED: {
    code: 'QUOTATION_EXPIRED',
    httpStatus: 422,
    message: 'This quotation has expired',
    suggestion: 'Create a new quotation or revise this one with updated validity.',
  },
  QUOTATION_NO_ITEMS: {
    code: 'QUOTATION_NO_ITEMS',
    httpStatus: 400,
    message: 'Quotation must have at least one line item',
    suggestion: 'Add items before sending the quotation.',
  },

  // ═══════════════════════════════════════════════════
  // TOUR PLAN
  // ═══════════════════════════════════════════════════
  TOUR_PLAN_NOT_FOUND: {
    code: 'TOUR_PLAN_NOT_FOUND',
    httpStatus: 404,
    message: 'Tour plan does not exist',
    suggestion: 'Verify the tour plan ID.',
  },
  TOUR_PLAN_ALREADY_APPROVED: {
    code: 'TOUR_PLAN_ALREADY_APPROVED',
    httpStatus: 422,
    message: 'This tour plan is already approved',
    suggestion: 'Approved plans cannot be modified. Create a new plan if needed.',
  },
  TOUR_PLAN_DATE_CONFLICT: {
    code: 'TOUR_PLAN_DATE_CONFLICT',
    httpStatus: 409,
    message: 'A tour plan already exists for this date range',
    suggestion: 'Modify the existing plan or choose different dates.',
  },

  // ═══════════════════════════════════════════════════
  // PRODUCT
  // ═══════════════════════════════════════════════════
  PRODUCT_NOT_FOUND: {
    code: 'PRODUCT_NOT_FOUND',
    httpStatus: 404,
    message: 'Product does not exist',
    suggestion: 'Verify the product ID. Use GET /products to list.',
  },
  PRODUCT_SKU_DUPLICATE: {
    code: 'PRODUCT_SKU_DUPLICATE',
    httpStatus: 409,
    message: 'A product with this SKU already exists',
    suggestion: 'Use a unique SKU or update the existing product.',
  },
  PRODUCT_INACTIVE: {
    code: 'PRODUCT_INACTIVE',
    httpStatus: 422,
    message: 'This product is inactive and cannot be added to quotations',
    suggestion: 'Activate the product first or choose an active product.',
  },

  // ═══════════════════════════════════════════════════
  // EMAIL
  // ═══════════════════════════════════════════════════
  EMAIL_ACCOUNT_NOT_FOUND: {
    code: 'EMAIL_ACCOUNT_NOT_FOUND',
    httpStatus: 404,
    message: 'Email account not found',
    suggestion: 'Connect an email account first in Settings > Email.',
  },
  EMAIL_SEND_FAILED: {
    code: 'EMAIL_SEND_FAILED',
    httpStatus: 500,
    message: 'Failed to send email',
    suggestion: 'Check email account credentials. Verify SMTP settings.',
  },
  EMAIL_DAILY_LIMIT_REACHED: {
    code: 'EMAIL_DAILY_LIMIT_REACHED',
    httpStatus: 429,
    message: 'Daily email sending limit reached',
    suggestion: 'Wait until tomorrow or upgrade your plan for higher limits. Limit: {limit}.',
  },
  EMAIL_TEMPLATE_NOT_FOUND: {
    code: 'EMAIL_TEMPLATE_NOT_FOUND',
    httpStatus: 404,
    message: 'Email template not found',
    suggestion: 'Verify the template ID. Use GET /email/templates to list.',
  },
  EMAIL_RECIPIENT_UNSUBSCRIBED: {
    code: 'EMAIL_RECIPIENT_UNSUBSCRIBED',
    httpStatus: 422,
    message: 'Recipient has unsubscribed from emails',
    suggestion: 'This contact has opted out. Respect their preference.',
  },

  // ═══════════════════════════════════════════════════
  // WHATSAPP
  // ═══════════════════════════════════════════════════
  WHATSAPP_NOT_CONFIGURED: {
    code: 'WHATSAPP_NOT_CONFIGURED',
    httpStatus: 422,
    message: 'WhatsApp Business is not configured',
    suggestion: 'Set up WhatsApp credentials in Settings > Integrations.',
  },
  WHATSAPP_WINDOW_EXPIRED: {
    code: 'WHATSAPP_WINDOW_EXPIRED',
    httpStatus: 422,
    message: '24-hour messaging window has expired for this contact',
    suggestion: 'Send a pre-approved template message to reopen the window.',
  },
  WHATSAPP_TEMPLATE_NOT_APPROVED: {
    code: 'WHATSAPP_TEMPLATE_NOT_APPROVED',
    httpStatus: 422,
    message: 'This WhatsApp template is not approved by Meta',
    suggestion: 'Wait for Meta approval or use an already-approved template.',
  },
  WHATSAPP_RECIPIENT_OPTED_OUT: {
    code: 'WHATSAPP_RECIPIENT_OPTED_OUT',
    httpStatus: 422,
    message: 'Recipient has opted out of WhatsApp messages',
    suggestion: 'This contact has opted out. Respect their preference.',
  },
  WHATSAPP_SEND_FAILED: {
    code: 'WHATSAPP_SEND_FAILED',
    httpStatus: 500,
    message: 'Failed to send WhatsApp message',
    suggestion: 'Check WhatsApp credentials and account quality rating.',
  },
  WHATSAPP_DAILY_LIMIT_REACHED: {
    code: 'WHATSAPP_DAILY_LIMIT_REACHED',
    httpStatus: 429,
    message: 'Daily WhatsApp sending limit reached',
    suggestion: 'Wait until tomorrow or upgrade your plan. Limit: {limit}.',
  },

  // ═══════════════════════════════════════════════════
  // DOCUMENT
  // ═══════════════════════════════════════════════════
  DOCUMENT_NOT_FOUND: {
    code: 'DOCUMENT_NOT_FOUND',
    httpStatus: 404,
    message: 'Document does not exist',
    suggestion: 'Verify the document ID.',
  },
  DOCUMENT_UPLOAD_FAILED: {
    code: 'DOCUMENT_UPLOAD_FAILED',
    httpStatus: 500,
    message: 'File upload failed',
    suggestion: 'Check file size (max 50MB) and format. Try again.',
  },
  DOCUMENT_TYPE_NOT_ALLOWED: {
    code: 'DOCUMENT_TYPE_NOT_ALLOWED',
    httpStatus: 400,
    message: 'This file type is not allowed',
    suggestion: 'Blocked types: .exe, .bat, .cmd, .sh. Upload a supported format.',
  },
  DOCUMENT_SIZE_EXCEEDED: {
    code: 'DOCUMENT_SIZE_EXCEEDED',
    httpStatus: 400,
    message: 'File size exceeds the maximum allowed limit',
    suggestion: 'Maximum file size is {maxSize}MB. Compress the file and try again.',
  },
  DOCUMENT_STORAGE_FULL: {
    code: 'DOCUMENT_STORAGE_FULL',
    httpStatus: 507,
    message: 'Storage limit reached for your plan',
    suggestion: 'Delete unused files or upgrade your plan for more storage.',
  },
  DOCUMENT_SHARE_LINK_EXPIRED: {
    code: 'DOCUMENT_SHARE_LINK_EXPIRED',
    httpStatus: 410,
    message: 'This share link has expired',
    suggestion: 'Request a new share link from the document owner.',
  },

  // ═══════════════════════════════════════════════════
  // IMPORT / EXPORT
  // ═══════════════════════════════════════════════════
  IMPORT_JOB_NOT_FOUND: {
    code: 'IMPORT_JOB_NOT_FOUND',
    httpStatus: 404,
    message: 'Import job does not exist',
    suggestion: 'Verify the import job ID.',
  },
  IMPORT_FILE_INVALID: {
    code: 'IMPORT_FILE_INVALID',
    httpStatus: 400,
    message: 'Import file format is invalid',
    suggestion: 'Upload a .xlsx, .xls, or .csv file with proper headers.',
  },
  IMPORT_MAPPING_INCOMPLETE: {
    code: 'IMPORT_MAPPING_INCOMPLETE',
    httpStatus: 400,
    message: 'Field mapping is incomplete. Required fields are not mapped.',
    suggestion: 'Map all required fields: {requiredFields}.',
  },
  IMPORT_PROFILE_NOT_FOUND: {
    code: 'IMPORT_PROFILE_NOT_FOUND',
    httpStatus: 404,
    message: 'Import profile not found',
    suggestion: 'Verify the profile ID or create a new import profile.',
  },
  EXPORT_JOB_NOT_FOUND: {
    code: 'EXPORT_JOB_NOT_FOUND',
    httpStatus: 404,
    message: 'Export job does not exist',
    suggestion: 'Verify the export job ID.',
  },

  // ═══════════════════════════════════════════════════
  // WORKFLOW
  // ═══════════════════════════════════════════════════
  WORKFLOW_NOT_FOUND: {
    code: 'WORKFLOW_NOT_FOUND',
    httpStatus: 404,
    message: 'Workflow does not exist',
    suggestion: 'Verify the workflow ID.',
  },
  WORKFLOW_INACTIVE: {
    code: 'WORKFLOW_INACTIVE',
    httpStatus: 422,
    message: 'This workflow is not active',
    suggestion: 'Activate the workflow before it can trigger.',
  },
  WORKFLOW_EXECUTION_FAILED: {
    code: 'WORKFLOW_EXECUTION_FAILED',
    httpStatus: 500,
    message: 'Workflow action execution failed',
    suggestion: 'Check workflow action configuration. See execution logs for details.',
  },

  // ═══════════════════════════════════════════════════
  // CONFIG & CREDENTIALS
  // ═══════════════════════════════════════════════════
  CONFIG_NOT_FOUND: {
    code: 'CONFIG_NOT_FOUND',
    httpStatus: 404,
    message: 'Configuration key not found',
    suggestion: 'Verify the config key. Use GET /config to list all.',
  },
  CONFIG_READ_ONLY: {
    code: 'CONFIG_READ_ONLY',
    httpStatus: 403,
    message: 'This configuration is read-only and cannot be modified',
    suggestion: 'This is a system-managed config. Contact super admin if needed.',
  },
  CONFIG_VALIDATION_FAILED: {
    code: 'CONFIG_VALIDATION_FAILED',
    httpStatus: 400,
    message: 'Configuration value does not meet validation rules',
    suggestion: 'Check allowed values: {validationRule}.',
  },
  CREDENTIAL_NOT_FOUND: {
    code: 'CREDENTIAL_NOT_FOUND',
    httpStatus: 404,
    message: 'Credential for this provider is not configured',
    suggestion: 'Set up credentials in Settings > Integrations > {provider}.',
  },
  CREDENTIAL_EXPIRED: {
    code: 'CREDENTIAL_EXPIRED',
    httpStatus: 422,
    message: 'API credential/token has expired',
    suggestion: 'Re-authenticate or refresh the token in Settings > Integrations.',
  },
  CREDENTIAL_VERIFICATION_FAILED: {
    code: 'CREDENTIAL_VERIFICATION_FAILED',
    httpStatus: 422,
    message: 'Credential verification failed — cannot connect to provider',
    suggestion: 'Check the credentials. Error: {error}.',
  },
  CREDENTIAL_DAILY_LIMIT: {
    code: 'CREDENTIAL_DAILY_LIMIT',
    httpStatus: 429,
    message: 'Daily API usage limit reached for this provider',
    suggestion: 'Wait until tomorrow or increase the daily limit in settings.',
  },
  ENCRYPTION_FAILED: {
    code: 'ENCRYPTION_FAILED',
    httpStatus: 500,
    message: 'Failed to encrypt/decrypt credential data',
    suggestion: 'Check ENCRYPTION_MASTER_KEY in environment. Contact system admin.',
  },

  // ═══════════════════════════════════════════════════
  // CRON JOBS
  // ═══════════════════════════════════════════════════
  CRON_JOB_NOT_FOUND: {
    code: 'CRON_JOB_NOT_FOUND',
    httpStatus: 404,
    message: 'Cron job does not exist',
    suggestion: 'Verify the job code. Use GET /admin/cron/jobs to list.',
  },
  CRON_JOB_ALREADY_RUNNING: {
    code: 'CRON_JOB_ALREADY_RUNNING',
    httpStatus: 409,
    message: 'This cron job is currently running',
    suggestion: 'Wait for the current execution to finish before running again.',
  },
  CRON_EXPRESSION_INVALID: {
    code: 'CRON_EXPRESSION_INVALID',
    httpStatus: 400,
    message: 'Invalid cron expression',
    suggestion: 'Use standard 5-field cron format: "*/5 * * * *". See crontab.guru.',
  },
  CRON_HANDLER_NOT_REGISTERED: {
    code: 'CRON_HANDLER_NOT_REGISTERED',
    httpStatus: 500,
    message: 'No handler registered for this cron job code',
    suggestion: 'Ensure the handler is implemented and registered in JobRegistryService.',
  },

  // ═══════════════════════════════════════════════════
  // OFFLINE SYNC
  // ═══════════════════════════════════════════════════
  SYNC_DIRECTION_NOT_ALLOWED: {
    code: 'SYNC_DIRECTION_NOT_ALLOWED',
    httpStatus: 403,
    message: 'Sync direction not allowed for this entity',
    suggestion: 'Entity {entity} is set to {direction}. Contact admin to change policy.',
  },
  SYNC_ENTITY_DISABLED: {
    code: 'SYNC_ENTITY_DISABLED',
    httpStatus: 403,
    message: 'Offline sync is disabled for this entity',
    suggestion: 'Contact admin to enable offline sync for {entity}.',
  },
  SYNC_CONFLICT_PENDING: {
    code: 'SYNC_CONFLICT_PENDING',
    httpStatus: 409,
    message: 'Sync conflict detected — manual resolution required',
    suggestion: 'Use GET /sync/conflicts/{id} to view both versions and resolve.',
  },
  SYNC_DEVICE_BLOCKED: {
    code: 'SYNC_DEVICE_BLOCKED',
    httpStatus: 403,
    message: 'This device has been blocked by admin',
    suggestion: 'Contact your administrator.',
  },
  SYNC_FLUSH_PENDING: {
    code: 'SYNC_FLUSH_PENDING',
    httpStatus: 409,
    message: 'A flush command is pending for this device',
    suggestion: 'Execute the flush first, then re-download data.',
  },
  SYNC_STALE_DATA_BLOCKED: {
    code: 'SYNC_STALE_DATA_BLOCKED',
    httpStatus: 403,
    message: 'Your offline data is too old. Sync required before any activity.',
    suggestion: 'Connect to internet and sync your data. Stale since: {staleSince}.',
  },

  // ═══════════════════════════════════════════════════
  // REPORT
  // ═══════════════════════════════════════════════════
  REPORT_NOT_FOUND: {
    code: 'REPORT_NOT_FOUND',
    httpStatus: 404,
    message: 'Report definition not found',
    suggestion: 'Verify the report code. Use GET /reports/definitions to list.',
  },
  REPORT_GENERATION_FAILED: {
    code: 'REPORT_GENERATION_FAILED',
    httpStatus: 500,
    message: 'Failed to generate report',
    suggestion: 'Check the date range and filters. Retry the request.',
  },
  REPORT_EXPORT_FAILED: {
    code: 'REPORT_EXPORT_FAILED',
    httpStatus: 500,
    message: 'Failed to export report to the requested format',
    suggestion: 'Try a different format (PDF/Excel/CSV). Check file size limits.',
  },

  // ═══════════════════════════════════════════════════
  // NOTIFICATION
  // ═══════════════════════════════════════════════════
  NOTIFICATION_NOT_FOUND: {
    code: 'NOTIFICATION_NOT_FOUND',
    httpStatus: 404,
    message: 'Notification does not exist',
    suggestion: 'Verify the notification ID.',
  },

  // ═══════════════════════════════════════════════════
  // USER & ROLE
  // ═══════════════════════════════════════════════════
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    httpStatus: 404,
    message: 'User does not exist',
    suggestion: 'Verify the user ID. Use GET /users to list.',
  },
  USER_ALREADY_EXISTS: {
    code: 'USER_ALREADY_EXISTS',
    httpStatus: 409,
    message: 'A user with this email already exists in this tenant',
    suggestion: 'Use a different email or reactivate the existing user.',
  },
  USER_INACTIVE: {
    code: 'USER_INACTIVE',
    httpStatus: 422,
    message: 'This user is inactive',
    suggestion: 'Activate the user first via PUT /users/{id}/activate.',
  },
  ROLE_NOT_FOUND: {
    code: 'ROLE_NOT_FOUND',
    httpStatus: 404,
    message: 'Role does not exist',
    suggestion: 'Verify the role ID. Use GET /roles to list.',
  },
  ROLE_IN_USE: {
    code: 'ROLE_IN_USE',
    httpStatus: 409,
    message: 'This role is assigned to users and cannot be deleted',
    suggestion: 'Reassign users to another role first, then delete.',
  },

  // ═══════════════════════════════════════════════════
  // MASTER & LOOKUP
  // ═══════════════════════════════════════════════════
  LOOKUP_NOT_FOUND: {
    code: 'LOOKUP_NOT_FOUND',
    httpStatus: 404,
    message: 'Lookup value not found',
    suggestion: 'Verify the lookup ID or value.',
  },
  LOOKUP_CATEGORY_NOT_FOUND: {
    code: 'LOOKUP_CATEGORY_NOT_FOUND',
    httpStatus: 404,
    message: 'Master lookup category not found',
    suggestion: 'Verify the category code. Use GET /masters to list categories.',
  },
  MASTER_SYSTEM_PROTECTED: {
    code: 'MASTER_SYSTEM_PROTECTED',
    httpStatus: 403,
    message: 'System-defined master records cannot be deleted',
    suggestion: 'You can deactivate it but not delete system records.',
  },

  // ═══════════════════════════════════════════════════
  // OWNERSHIP
  // ═══════════════════════════════════════════════════
  OWNERSHIP_NOT_FOUND: {
    code: 'OWNERSHIP_NOT_FOUND',
    httpStatus: 404,
    message: 'Entity ownership record not found',
    suggestion: 'Verify the entity ID and owner combination.',
  },
  OWNERSHIP_ALREADY_ASSIGNED: {
    code: 'OWNERSHIP_ALREADY_ASSIGNED',
    httpStatus: 409,
    message: 'This user is already an owner of this entity',
    suggestion: 'The ownership already exists. Update the owner type if needed.',
  },

  // ═══════════════════════════════════════════════════
  // MENU
  // ═══════════════════════════════════════════════════
  MENU_NOT_FOUND: {
    code: 'MENU_NOT_FOUND',
    httpStatus: 404,
    message: 'Menu item not found',
    suggestion: 'Verify the menu ID.',
  },

  // ═══════════════════════════════════════════════════
  // CUSTOM FIELD
  // ═══════════════════════════════════════════════════
  CUSTOM_FIELD_NOT_FOUND: {
    code: 'CUSTOM_FIELD_NOT_FOUND',
    httpStatus: 404,
    message: 'Custom field definition not found',
    suggestion: 'Verify the field ID.',
  },
  CUSTOM_FIELD_VALUE_INVALID: {
    code: 'CUSTOM_FIELD_VALUE_INVALID',
    httpStatus: 400,
    message: 'Custom field value does not match the expected type',
    suggestion: 'Field {fieldName} expects type {expectedType}.',
  },

  // ═══════════════════════════════════════════════════
  // APPROVAL
  // ═══════════════════════════════════════════════════
  APPROVAL_REQUIRED: {
    code: 'APPROVAL_REQUIRED',
    httpStatus: 422,
    message: 'This action requires approval before it can proceed',
    suggestion: 'An approval request has been created. Wait for manager approval.',
  },
  APPROVAL_EXPIRED: {
    code: 'APPROVAL_EXPIRED',
    httpStatus: 422,
    message: 'The approval request has expired',
    suggestion: 'Submit a new approval request.',
  },
  APPROVAL_REJECTED: {
    code: 'APPROVAL_REJECTED',
    httpStatus: 422,
    message: 'The approval request was rejected',
    suggestion: 'Check the rejection reason and resubmit with changes if needed.',
  },

  // ═══════════════════════════════════════════════════
  // FOLLOW-UP & REMINDER
  // ═══════════════════════════════════════════════════
  FOLLOW_UP_NOT_FOUND: {
    code: 'FOLLOW_UP_NOT_FOUND',
    httpStatus: 404,
    message: 'Follow-up does not exist',
    suggestion: 'Verify the follow-up ID.',
  },
  REMINDER_NOT_FOUND: {
    code: 'REMINDER_NOT_FOUND',
    httpStatus: 404,
    message: 'Reminder does not exist',
    suggestion: 'Verify the reminder ID.',
  },

  // ═══════════════════════════════════════════════════
  // DEPARTMENT & DESIGNATION & BRAND & MANUFACTURER & LOCATION
  // ═══════════════════════════════════════════════════
  DEPARTMENT_NOT_FOUND: {
    code: 'DEPARTMENT_NOT_FOUND',
    httpStatus: 404,
    message: 'Department does not exist',
    suggestion: 'Verify the department ID.',
  },
  DESIGNATION_NOT_FOUND: {
    code: 'DESIGNATION_NOT_FOUND',
    httpStatus: 404,
    message: 'Designation does not exist',
    suggestion: 'Verify the designation ID.',
  },
  BRAND_NOT_FOUND: {
    code: 'BRAND_NOT_FOUND',
    httpStatus: 404,
    message: 'Brand does not exist',
    suggestion: 'Verify the brand ID.',
  },
  MANUFACTURER_NOT_FOUND: {
    code: 'MANUFACTURER_NOT_FOUND',
    httpStatus: 404,
    message: 'Manufacturer does not exist',
    suggestion: 'Verify the manufacturer ID.',
  },
  LOCATION_NOT_FOUND: {
    code: 'LOCATION_NOT_FOUND',
    httpStatus: 404,
    message: 'Business location does not exist',
    suggestion: 'Verify the location ID.',
  },
  // ═══════════════════════════════════════════════════
  // INVOICE
  // ═══════════════════════════════════════════════════
  INVOICE_NOT_FOUND: {
    code: 'INVOICE_NOT_FOUND',
    httpStatus: 404,
    message: 'Invoice not found',
    suggestion: 'Verify the invoice ID or invoice number.',
  },
  INVOICE_ALREADY_PAID: {
    code: 'INVOICE_ALREADY_PAID',
    httpStatus: 409,
    message: 'Invoice is already fully paid',
    suggestion: 'This invoice has no outstanding balance.',
  },
  INVOICE_CANCELLED: {
    code: 'INVOICE_CANCELLED',
    httpStatus: 422,
    message: 'Invoice has been cancelled',
    suggestion: 'Cancelled invoices cannot be modified or paid.',
  },
  INVOICE_VOID: {
    code: 'INVOICE_VOID',
    httpStatus: 422,
    message: 'Invoice has been voided',
    suggestion: 'Voided invoices cannot be modified or paid.',
  },
  INVOICE_GENERATION_FAILED: {
    code: 'INVOICE_GENERATION_FAILED',
    httpStatus: 500,
    message: 'Failed to generate invoice from quotation',
    suggestion: 'Ensure quotation has valid line items and customer info.',
  },

  // ═══════════════════════════════════════════════════
  // PAYMENT
  // ═══════════════════════════════════════════════════
  PAYMENT_NOT_FOUND: {
    code: 'PAYMENT_NOT_FOUND',
    httpStatus: 404,
    message: 'Payment not found',
    suggestion: 'Verify the payment ID or payment number.',
  },
  PAYMENT_ALREADY_CAPTURED: {
    code: 'PAYMENT_ALREADY_CAPTURED',
    httpStatus: 409,
    message: 'Payment has already been captured',
    suggestion: 'This payment is already processed.',
  },
  PAYMENT_EXCEEDS_BALANCE: {
    code: 'PAYMENT_EXCEEDS_BALANCE',
    httpStatus: 422,
    message: 'Payment amount exceeds invoice balance',
    suggestion: 'Reduce the payment amount to match the outstanding balance.',
  },
  PAYMENT_GATEWAY_ERROR: {
    code: 'PAYMENT_GATEWAY_ERROR',
    httpStatus: 502,
    message: 'Payment gateway returned an error',
    suggestion: 'Check gateway credentials and try again.',
  },
  PAYMENT_SIGNATURE_INVALID: {
    code: 'PAYMENT_SIGNATURE_INVALID',
    httpStatus: 400,
    message: 'Payment signature verification failed',
    suggestion: 'The payment callback signature is invalid. Possible tampering.',
  },
  PAYMENT_GATEWAY_NOT_CONFIGURED: {
    code: 'PAYMENT_GATEWAY_NOT_CONFIGURED',
    httpStatus: 422,
    message: 'Payment gateway is not configured for this tenant',
    suggestion: 'Configure Razorpay or Stripe credentials in Settings.',
  },

  // ═══════════════════════════════════════════════════
  // REFUND
  // ═══════════════════════════════════════════════════
  REFUND_NOT_FOUND: {
    code: 'REFUND_NOT_FOUND',
    httpStatus: 404,
    message: 'Refund not found',
    suggestion: 'Verify the refund ID.',
  },
  REFUND_EXCEEDS_PAYMENT: {
    code: 'REFUND_EXCEEDS_PAYMENT',
    httpStatus: 422,
    message: 'Refund amount exceeds the original payment amount',
    suggestion: 'Reduce the refund amount.',
  },
  REFUND_ALREADY_PROCESSED: {
    code: 'REFUND_ALREADY_PROCESSED',
    httpStatus: 409,
    message: 'Refund has already been processed',
    suggestion: 'This refund cannot be modified.',
  },

  // ═══════════════════════════════════════════════════
  // CREDIT NOTE
  // ═══════════════════════════════════════════════════
  CREDIT_NOTE_NOT_FOUND: {
    code: 'CREDIT_NOTE_NOT_FOUND',
    httpStatus: 404,
    message: 'Credit note not found',
    suggestion: 'Verify the credit note ID.',
  },
  CREDIT_NOTE_ALREADY_APPLIED: {
    code: 'CREDIT_NOTE_ALREADY_APPLIED',
    httpStatus: 409,
    message: 'Credit note has already been applied',
    suggestion: 'This credit note cannot be applied again.',
  },
  CREDIT_NOTE_EXCEEDS_INVOICE: {
    code: 'CREDIT_NOTE_EXCEEDS_INVOICE',
    httpStatus: 422,
    message: 'Credit note amount exceeds invoice amount',
    suggestion: 'Reduce the credit note amount.',
  },

  // ═══════════════════════════════════════════════════
  // RECEIPT
  // ═══════════════════════════════════════════════════
  RECEIPT_NOT_FOUND: {
    code: 'RECEIPT_NOT_FOUND',
    httpStatus: 404,
    message: 'Payment receipt not found',
    suggestion: 'Verify the receipt ID.',
  },

  // ═══════════════════════════════════════════════════
  // API GATEWAY
  // ═══════════════════════════════════════════════════
  API_KEY_NOT_FOUND: {
    code: 'API_KEY_NOT_FOUND',
    httpStatus: 404,
    message: 'API key not found',
    suggestion: 'Verify the API key ID.',
  },
  API_KEY_REVOKED: {
    code: 'API_KEY_REVOKED',
    httpStatus: 401,
    message: 'API key has been revoked',
    suggestion: 'Generate a new API key.',
  },
  API_KEY_EXPIRED: {
    code: 'API_KEY_EXPIRED',
    httpStatus: 401,
    message: 'API key has expired',
    suggestion: 'Generate a new API key or extend expiry.',
  },
  API_KEY_IP_BLOCKED: {
    code: 'API_KEY_IP_BLOCKED',
    httpStatus: 403,
    message: 'Request IP not in allowed list',
    suggestion: 'Add your IP to the API key allowed IPs.',
  },
  API_KEY_LIMIT_REACHED: {
    code: 'API_KEY_LIMIT_REACHED',
    httpStatus: 403,
    message: 'Maximum API keys limit reached for your plan',
    suggestion: 'Upgrade plan or revoke unused keys.',
  },
  API_SCOPE_INSUFFICIENT: {
    code: 'API_SCOPE_INSUFFICIENT',
    httpStatus: 403,
    message: 'API key lacks required scope',
    suggestion: 'Update key scopes or use a key with the required permissions.',
  },
  WEBHOOK_NOT_FOUND: {
    code: 'WEBHOOK_NOT_FOUND',
    httpStatus: 404,
    message: 'Webhook endpoint not found',
    suggestion: 'Verify the webhook endpoint ID.',
  },
  WEBHOOK_DELIVERY_FAILED: {
    code: 'WEBHOOK_DELIVERY_FAILED',
    httpStatus: 502,
    message: 'Webhook delivery failed',
    suggestion: 'Check the target URL and retry.',
  },
  WEBHOOK_LIMIT_REACHED: {
    code: 'WEBHOOK_LIMIT_REACHED',
    httpStatus: 403,
    message: 'Maximum webhook endpoints limit reached',
    suggestion: 'Upgrade plan or remove unused endpoints.',
  },
  API_VERSION_UNSUPPORTED: {
    code: 'API_VERSION_UNSUPPORTED',
    httpStatus: 400,
    message: 'API version is not supported',
    suggestion: 'Use a supported API version (v1).',
  },

  // ═══════════════════════════════════════════════════
  // CALENDAR & SCHEDULING
  // ═══════════════════════════════════════════════════

  CALENDAR_EVENT_NOT_FOUND: {
    code: 'CALENDAR_EVENT_NOT_FOUND',
    httpStatus: 404,
    message: 'Calendar event does not exist',
    suggestion: 'Verify the event ID. Use GET /calendar/events to list events.',
  },
  CALENDAR_EVENT_CONFLICT: {
    code: 'CALENDAR_EVENT_CONFLICT',
    httpStatus: 409,
    message: 'The scheduled time conflicts with an existing event',
    suggestion: 'Use POST /calendar/availability/free-slots to find available times.',
  },
  CALENDAR_EVENT_PAST: {
    code: 'CALENDAR_EVENT_PAST',
    httpStatus: 422,
    message: 'Cannot create or modify events in the past',
    suggestion: 'Choose a future date/time for the event.',
  },
  CALENDAR_EVENT_CANCELLED: {
    code: 'CALENDAR_EVENT_CANCELLED',
    httpStatus: 422,
    message: 'This event has been cancelled and cannot be modified',
    suggestion: 'Create a new event instead.',
  },
  CALENDAR_INVALID_TIME_RANGE: {
    code: 'CALENDAR_INVALID_TIME_RANGE',
    httpStatus: 400,
    message: 'End time must be after start time',
    suggestion: 'Ensure endTime is later than startTime.',
  },
  CALENDAR_PARTICIPANT_EXISTS: {
    code: 'CALENDAR_PARTICIPANT_EXISTS',
    httpStatus: 409,
    message: 'This participant is already added to the event',
    suggestion: 'Check existing participants before adding.',
  },
  CALENDAR_SYNC_NOT_CONFIGURED: {
    code: 'CALENDAR_SYNC_NOT_CONFIGURED',
    httpStatus: 404,
    message: 'Calendar sync is not configured for this provider',
    suggestion: 'Connect your calendar via POST /calendar/sync/connect.',
  },
  CALENDAR_SYNC_ALREADY_CONNECTED: {
    code: 'CALENDAR_SYNC_ALREADY_CONNECTED',
    httpStatus: 409,
    message: 'Calendar is already connected for this provider',
    suggestion: 'Disconnect first, then reconnect.',
  },
  CALENDAR_SYNC_AUTH_FAILED: {
    code: 'CALENDAR_SYNC_AUTH_FAILED',
    httpStatus: 401,
    message: 'Calendar sync authentication failed',
    suggestion: 'Reconnect your calendar to refresh credentials.',
  },
  CALENDAR_AVAILABILITY_NOT_SET: {
    code: 'CALENDAR_AVAILABILITY_NOT_SET',
    httpStatus: 404,
    message: 'Working hours are not configured for this user',
    suggestion: 'Set working hours via PUT /calendar/availability/working-hours.',
  },

  // ═══════════════════════════════════════════════════
  // VERIFICATION
  // ═══════════════════════════════════════════════════
  VERIFICATION_REQUIRED: {
    code: 'VERIFICATION_REQUIRED',
    httpStatus: 403,
    message: 'Please verify your email and mobile to continue',
    suggestion: 'Go to Settings → Verification to verify your account.',
  },
  OTP_EXPIRED: {
    code: 'OTP_EXPIRED',
    httpStatus: 400,
    message: 'OTP has expired. Please request a new one.',
    suggestion: 'Click "Resend OTP" to get a new code.',
  },
  OTP_INVALID: {
    code: 'OTP_INVALID',
    httpStatus: 400,
    message: 'Invalid OTP. Please check and try again.',
    suggestion: 'Enter the 6-digit code sent to your email/phone.',
  },
  OTP_MAX_ATTEMPTS: {
    code: 'OTP_MAX_ATTEMPTS',
    httpStatus: 429,
    message: 'Too many OTP attempts. Please request a new OTP.',
    suggestion: 'Wait 60 seconds then request a new OTP.',
  },
  GST_INVALID_FORMAT: {
    code: 'GST_INVALID_FORMAT',
    httpStatus: 400,
    message: 'Invalid GST number format',
    suggestion: 'GST number should be 15 characters (e.g., 27AABCU9603R1ZM).',
  },
  GST_ALREADY_REGISTERED: {
    code: 'GST_ALREADY_REGISTERED',
    httpStatus: 409,
    message: 'This GST number is already registered with another account',
    suggestion: 'Contact support if you believe this is an error.',
  },
  EMAIL_ALREADY_VERIFIED: {
    code: 'EMAIL_ALREADY_VERIFIED',
    httpStatus: 400,
    message: 'Email is already verified',
    suggestion: 'No action needed — your email is already verified.',
  },
  MOBILE_ALREADY_VERIFIED: {
    code: 'MOBILE_ALREADY_VERIFIED',
    httpStatus: 400,
    message: 'Mobile is already verified',
    suggestion: 'No action needed — your mobile is already verified.',
  },

  // ═══════════════════════════════════════════════════
  // MARKETPLACE
  // ═══════════════════════════════════════════════════
  LISTING_NOT_FOUND: {
    code: 'LISTING_NOT_FOUND',
    httpStatus: 404,
    message: 'Listing not found',
    suggestion: 'The listing may have been removed or expired.',
  },
  LISTING_EXPIRED: {
    code: 'LISTING_EXPIRED',
    httpStatus: 410,
    message: 'This listing has expired',
    suggestion: 'Contact the vendor for availability.',
  },
  LISTING_INACTIVE: {
    code: 'LISTING_INACTIVE',
    httpStatus: 400,
    message: 'This listing is not currently active',
    suggestion: 'The vendor may have paused this listing.',
  },
  B2B_VERIFICATION_REQUIRED: {
    code: 'B2B_VERIFICATION_REQUIRED',
    httpStatus: 403,
    message: 'B2B pricing requires GST verification',
    suggestion: 'Verify your GST number to access wholesale pricing.',
  },
  ENQUIRY_NOT_FOUND: {
    code: 'ENQUIRY_NOT_FOUND',
    httpStatus: 404,
    message: 'Enquiry not found',
    suggestion: 'Verify the enquiry ID.',
  },
  ORDER_NOT_FOUND: {
    code: 'ORDER_NOT_FOUND',
    httpStatus: 404,
    message: 'Order not found',
    suggestion: 'Verify the order ID or order number.',
  },
  ORDER_EMPTY_ITEMS: {
    code: 'ORDER_EMPTY_ITEMS',
    httpStatus: 400,
    message: 'Order must contain at least one item',
    suggestion: 'Add items to your order before submitting.',
  },
  POST_NOT_FOUND: {
    code: 'POST_NOT_FOUND',
    httpStatus: 404,
    message: 'Post not found',
    suggestion: 'The post may have been deleted.',
  },

  // ═══════════════════════════════════════════════════
  // PLUGIN
  // ═══════════════════════════════════════════════════
  PLUGIN_NOT_CONFIGURED: {
    code: 'PLUGIN_NOT_CONFIGURED',
    httpStatus: 400,
    message: 'Plugin is not configured',
    suggestion: 'Go to Settings → Integrations to configure the plugin.',
  },
  PLUGIN_CREDENTIALS_INVALID: {
    code: 'PLUGIN_CREDENTIALS_INVALID',
    httpStatus: 401,
    message: 'Plugin credentials are invalid',
    suggestion: 'Update the API credentials in Settings → Integrations.',
  },
  PLUGIN_API_FAILED: {
    code: 'PLUGIN_API_FAILED',
    httpStatus: 502,
    message: 'External plugin API request failed',
    suggestion: 'Try again. If the issue persists, check the plugin status.',
  },

  // ═══════════════════════════════════════════════════
  // TICKET & POST-SALES
  // ═══════════════════════════════════════════════════
  TICKET_NOT_FOUND: {
    code: 'TICKET_NOT_FOUND',
    httpStatus: 404,
    message: 'Support ticket does not exist',
    suggestion: 'Verify the ticket ID or ticket number.',
  },
  TICKET_CLOSED: {
    code: 'TICKET_CLOSED',
    httpStatus: 400,
    message: 'This ticket has been closed',
    suggestion: 'Reopen the ticket or create a new one.',
  },
  TOUR_PLAN_CONFLICT: {
    code: 'TOUR_PLAN_CONFLICT',
    httpStatus: 409,
    message: 'A tour plan already exists for this date',
    suggestion: 'Edit the existing tour plan or choose a different date.',
  },

  // ═══════════════════════════════════════════════════
  // PROCUREMENT
  // ═══════════════════════════════════════════════════
  PURCHASE_ORDER_SALE_ORDER_NOT_FOUND: {
    code: 'PURCHASE_ORDER_SALE_ORDER_NOT_FOUND',
    httpStatus: 404,
    message: 'Sale Order not found',
    suggestion: 'Check the Sale Order ID and verify it belongs to your account.',
  },

  // ═══════════════════════════════════════════════════
  // COMMUNICATION LOG (CUSTOMER PORTAL)
  // ═══════════════════════════════════════════════════
  COMMUNICATION_LOG_NOT_FOUND: {
    code: 'COMMUNICATION_LOG_NOT_FOUND',
    httpStatus: 404,
    message: 'Communication log entry not found',
    suggestion: 'Refresh the list and retry with a current entry ID.',
  },
  COMMUNICATION_LOG_CANNOT_RETRY_SENT: {
    code: 'COMMUNICATION_LOG_CANNOT_RETRY_SENT',
    httpStatus: 400,
    message: 'This communication was already delivered and cannot be retried',
    suggestion: 'Only FAILED or SKIPPED entries can be retried.',
  },
  COMMUNICATION_LOG_CHANNEL_NOT_SUPPORTED: {
    code: 'COMMUNICATION_LOG_CHANNEL_NOT_SUPPORTED',
    httpStatus: 400,
    message: 'Retry is not supported for this channel',
    suggestion: 'Retry is currently supported for EMAIL and WHATSAPP channels only.',
  },
};

/** Total error codes count. */
export const TOTAL_ERROR_CODES = Object.keys(ERROR_CODES).length;
