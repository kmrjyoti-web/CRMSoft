# CRM API — Error Code Reference

> Auto-generated. Total error codes: **121**

## Error Response Format

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Lead does not exist",
  "error": {
    "code": "LEAD_NOT_FOUND",
    "message": "Lead does not exist",
    "details": null,
    "suggestion": "Verify the lead ID. Use GET /leads to list all leads.",
    "documentationUrl": "/docs/errors#LEAD_NOT_FOUND"
  },
  "timestamp": "2026-02-27T10:30:00.000Z",
  "path": "/api/v1/leads/xyz",
  "requestId": "req_abc123def456"
}
```

## Error Codes by Category

### Generic

| Code | HTTP | Message | Suggestion |
|------|------|---------|------------|
| `INTERNAL_ERROR` | 500 | An unexpected internal error occurred | This is a server-side issue. Contact support with the requestId. |
| `VALIDATION_ERROR` | 400 | One or more fields have invalid values | Check the details array for field-level errors and fix each one. |
| `NOT_FOUND` | 404 | The requested resource was not found | Verify the resource ID exists. Use the list endpoint to check. |
| `DUPLICATE_ENTRY` | 409 | A record with the same unique value already exists | Check for existing records with the same email, phone, or unique identifier. |
| `INVALID_STATE` | 422 | The operation is not valid for the current state of the resource | Check the current status/state of the resource before performing this action. |
| `INVALID_INPUT` | 400 | The provided input is not valid | Review the request body and ensure all required fields are correct. |
| `OPERATION_FAILED` | 500 | The operation could not be completed | Retry the request. If the problem persists, contact support. |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests. Rate limit exceeded. | Wait before making more requests. Check rate limit headers. |
| `SERVICE_UNAVAILABLE` | 503 | The service is temporarily unavailable | Try again in a few minutes. |

### Auth & Access

| Code | HTTP | Message | Suggestion |
|------|------|---------|------------|
| `AUTH_TOKEN_MISSING` | 401 | Authentication token is missing | Include a valid Bearer token in the Authorization header. |
| `AUTH_TOKEN_EXPIRED` | 401 | Authentication token has expired | Obtain a new token via POST /auth/login. |
| `AUTH_TOKEN_INVALID` | 401 | Authentication token is invalid or malformed | Ensure the token is correctly formatted and not tampered with. |
| `AUTH_INVALID_CREDENTIALS` | 401 | Invalid email or password | Check your email and password. Use POST /auth/forgot-password if needed. |
| `AUTH_ACCOUNT_LOCKED` | 423 | Account is locked due to too many failed login attempts | Wait 30 minutes or contact your admin to unlock. |
| `AUTH_ACCOUNT_INACTIVE` | 403 | Your account is inactive or suspended | Contact your administrator to reactivate your account. |
| `PERMISSION_DENIED` | 403 | You lack the specific permission required for this action | Required permission: {permission}. Ask your admin to grant it. |

### Other

| Code | HTTP | Message | Suggestion |
|------|------|---------|------------|
| `FORBIDDEN` | 403 | You do not have permission to perform this action | Contact your admin to get the required role/permission. |
| `ROLE_INSUFFICIENT` | 403 | Your role does not have access to this resource | Required role: {role}. Contact your admin. |
| `ACTIVITY_NOT_FOUND` | 404 | Activity does not exist | Verify the activity ID. |
| `ACTIVITY_ALREADY_COMPLETED` | 422 | This activity is already marked as completed | Completed activities cannot be modified. Create a new activity if needed. |
| `DEMO_NOT_FOUND` | 404 | Demo does not exist | Verify the demo ID. Use GET /demos to list. |
| `DEMO_ALREADY_COMPLETED` | 422 | This demo is already completed and cannot be rescheduled | Schedule a new demo instead. |
| `DEMO_TIME_CONFLICT` | 409 | A demo is already scheduled at this time for this user | Choose a different time slot. Check GET /demos/calendar for availability. |
| `TOUR_PLAN_NOT_FOUND` | 404 | Tour plan does not exist | Verify the tour plan ID. |
| `TOUR_PLAN_ALREADY_APPROVED` | 422 | This tour plan is already approved | Approved plans cannot be modified. Create a new plan if needed. |
| `TOUR_PLAN_DATE_CONFLICT` | 409 | A tour plan already exists for this date range | Modify the existing plan or choose different dates. |
| `NOTIFICATION_NOT_FOUND` | 404 | Notification does not exist | Verify the notification ID. |
| `USER_NOT_FOUND` | 404 | User does not exist | Verify the user ID. Use GET /users to list. |
| `USER_ALREADY_EXISTS` | 409 | A user with this email already exists in this tenant | Use a different email or reactivate the existing user. |
| `USER_INACTIVE` | 422 | This user is inactive | Activate the user first via PUT /users/{id}/activate. |
| `ROLE_NOT_FOUND` | 404 | Role does not exist | Verify the role ID. Use GET /roles to list. |
| `ROLE_IN_USE` | 409 | This role is assigned to users and cannot be deleted | Reassign users to another role first, then delete. |
| `LOOKUP_NOT_FOUND` | 404 | Lookup value not found | Verify the lookup ID or value. |
| `LOOKUP_CATEGORY_NOT_FOUND` | 404 | Master lookup category not found | Verify the category code. Use GET /masters to list categories. |
| `MASTER_SYSTEM_PROTECTED` | 403 | System-defined master records cannot be deleted | You can deactivate it but not delete system records. |
| `OWNERSHIP_NOT_FOUND` | 404 | Entity ownership record not found | Verify the entity ID and owner combination. |
| `OWNERSHIP_ALREADY_ASSIGNED` | 409 | This user is already an owner of this entity | The ownership already exists. Update the owner type if needed. |
| `MENU_NOT_FOUND` | 404 | Menu item not found | Verify the menu ID. |
| `CUSTOM_FIELD_NOT_FOUND` | 404 | Custom field definition not found | Verify the field ID. |
| `CUSTOM_FIELD_VALUE_INVALID` | 400 | Custom field value does not match the expected type | Field {fieldName} expects type {expectedType}. |
| `APPROVAL_REQUIRED` | 422 | This action requires approval before it can proceed | An approval request has been created. Wait for manager approval. |
| `APPROVAL_EXPIRED` | 422 | The approval request has expired | Submit a new approval request. |
| `APPROVAL_REJECTED` | 422 | The approval request was rejected | Check the rejection reason and resubmit with changes if needed. |
| `FOLLOW_UP_NOT_FOUND` | 404 | Follow-up does not exist | Verify the follow-up ID. |
| `REMINDER_NOT_FOUND` | 404 | Reminder does not exist | Verify the reminder ID. |
| `DEPARTMENT_NOT_FOUND` | 404 | Department does not exist | Verify the department ID. |
| `DESIGNATION_NOT_FOUND` | 404 | Designation does not exist | Verify the designation ID. |
| `BRAND_NOT_FOUND` | 404 | Brand does not exist | Verify the brand ID. |
| `MANUFACTURER_NOT_FOUND` | 404 | Manufacturer does not exist | Verify the manufacturer ID. |
| `LOCATION_NOT_FOUND` | 404 | Business location does not exist | Verify the location ID. |

### Tenant & Subscription

| Code | HTTP | Message | Suggestion |
|------|------|---------|------------|
| `TENANT_NOT_FOUND` | 404 | Tenant does not exist | Verify the tenant slug or ID. Check if the account has been created. |
| `TENANT_SUSPENDED` | 403 | Your organization account is suspended | Contact billing support or clear overdue payments to reactivate. |
| `TENANT_TRIAL_EXPIRED` | 403 | Your trial period has expired | Subscribe to a paid plan to continue using the platform. |
| `PLAN_LIMIT_REACHED` | 403 | You have reached the limit for your current plan | Upgrade your plan or delete unused records. Current: {current}/{limit}. |
| `FEATURE_NOT_AVAILABLE` | 403 | This feature is not available on your current plan | Upgrade to a plan that includes {feature}. |
| `SUBSCRIPTION_EXPIRED` | 403 | Your subscription has expired | Renew your subscription to continue. |

### Lead

| Code | HTTP | Message | Suggestion |
|------|------|---------|------------|
| `LEAD_NOT_FOUND` | 404 | Lead does not exist | Verify the lead ID. Use GET /leads to list all leads. |
| `LEAD_ALREADY_WON` | 422 | This lead is already marked as WON and cannot be modified | WON leads are locked. Create a new lead if needed. |
| `LEAD_ALREADY_LOST` | 422 | This lead is already marked as LOST | Reopen the lead first using PUT /leads/{id}/reopen if allowed. |
| `LEAD_STATUS_INVALID_TRANSITION` | 422 | Cannot transition lead from {from} to {to} | Valid transitions from {from}: {validTransitions}. Check the lead workflow. |
| `LEAD_ALLOCATION_FAILED` | 422 | Lead could not be allocated to the specified user | Check if the user is active and has capacity. Max leads: {maxLeads}. |
| `LEAD_LOST_REASON_REQUIRED` | 400 | A reason is required when marking a lead as LOST | Provide lostReasonId in the request body. |
| `LEAD_EXPECTED_VALUE_REQUIRED` | 400 | Expected value is required for this lead status | Provide expectedValue before moving to QUOTATION_SENT or later stages. |

### Contact

| Code | HTTP | Message | Suggestion |
|------|------|---------|------------|
| `CONTACT_NOT_FOUND` | 404 | Contact does not exist | Verify the contact ID. Use GET /contacts to search. |
| `CONTACT_DUPLICATE_EMAIL` | 409 | A contact with this email already exists | Use the existing contact or update their details. |
| `CONTACT_DUPLICATE_PHONE` | 409 | A contact with this phone number already exists | Use the existing contact or update their details. |

### Organization

| Code | HTTP | Message | Suggestion |
|------|------|---------|------------|
| `ORGANIZATION_NOT_FOUND` | 404 | Organization does not exist | Verify the organization ID. Use GET /organizations to search. |
| `ORGANIZATION_DUPLICATE_GST` | 409 | An organization with this GST number already exists | Search by GST to find the existing organization. |

### Quotation

| Code | HTTP | Message | Suggestion |
|------|------|---------|------------|
| `QUOTATION_NOT_FOUND` | 404 | Quotation does not exist | Verify the quotation ID. |
| `QUOTATION_ALREADY_SENT` | 422 | This quotation has already been sent and cannot be edited | Create a revision using POST /quotations/{id}/revise. |
| `QUOTATION_EXPIRED` | 422 | This quotation has expired | Create a new quotation or revise this one with updated validity. |
| `QUOTATION_NO_ITEMS` | 400 | Quotation must have at least one line item | Add items before sending the quotation. |

### Product

| Code | HTTP | Message | Suggestion |
|------|------|---------|------------|
| `PRODUCT_NOT_FOUND` | 404 | Product does not exist | Verify the product ID. Use GET /products to list. |
| `PRODUCT_SKU_DUPLICATE` | 409 | A product with this SKU already exists | Use a unique SKU or update the existing product. |
| `PRODUCT_INACTIVE` | 422 | This product is inactive and cannot be added to quotations | Activate the product first or choose an active product. |

### Email

| Code | HTTP | Message | Suggestion |
|------|------|---------|------------|
| `EMAIL_ACCOUNT_NOT_FOUND` | 404 | Email account not found | Connect an email account first in Settings > Email. |
| `EMAIL_SEND_FAILED` | 500 | Failed to send email | Check email account credentials. Verify SMTP settings. |
| `EMAIL_DAILY_LIMIT_REACHED` | 429 | Daily email sending limit reached | Wait until tomorrow or upgrade your plan for higher limits. Limit: {limit}. |
| `EMAIL_TEMPLATE_NOT_FOUND` | 404 | Email template not found | Verify the template ID. Use GET /email/templates to list. |
| `EMAIL_RECIPIENT_UNSUBSCRIBED` | 422 | Recipient has unsubscribed from emails | This contact has opted out. Respect their preference. |

### WhatsApp

| Code | HTTP | Message | Suggestion |
|------|------|---------|------------|
| `WHATSAPP_NOT_CONFIGURED` | 422 | WhatsApp Business is not configured | Set up WhatsApp credentials in Settings > Integrations. |
| `WHATSAPP_WINDOW_EXPIRED` | 422 | 24-hour messaging window has expired for this contact | Send a pre-approved template message to reopen the window. |
| `WHATSAPP_TEMPLATE_NOT_APPROVED` | 422 | This WhatsApp template is not approved by Meta | Wait for Meta approval or use an already-approved template. |
| `WHATSAPP_RECIPIENT_OPTED_OUT` | 422 | Recipient has opted out of WhatsApp messages | This contact has opted out. Respect their preference. |
| `WHATSAPP_SEND_FAILED` | 500 | Failed to send WhatsApp message | Check WhatsApp credentials and account quality rating. |
| `WHATSAPP_DAILY_LIMIT_REACHED` | 429 | Daily WhatsApp sending limit reached | Wait until tomorrow or upgrade your plan. Limit: {limit}. |

### Document

| Code | HTTP | Message | Suggestion |
|------|------|---------|------------|
| `DOCUMENT_NOT_FOUND` | 404 | Document does not exist | Verify the document ID. |
| `DOCUMENT_UPLOAD_FAILED` | 500 | File upload failed | Check file size (max 50MB) and format. Try again. |
| `DOCUMENT_TYPE_NOT_ALLOWED` | 400 | This file type is not allowed | Blocked types: .exe, .bat, .cmd, .sh. Upload a supported format. |
| `DOCUMENT_SIZE_EXCEEDED` | 400 | File size exceeds the maximum allowed limit | Maximum file size is {maxSize}MB. Compress the file and try again. |
| `DOCUMENT_STORAGE_FULL` | 507 | Storage limit reached for your plan | Delete unused files or upgrade your plan for more storage. |
| `DOCUMENT_SHARE_LINK_EXPIRED` | 410 | This share link has expired | Request a new share link from the document owner. |

### Import / Export

| Code | HTTP | Message | Suggestion |
|------|------|---------|------------|
| `IMPORT_JOB_NOT_FOUND` | 404 | Import job does not exist | Verify the import job ID. |
| `IMPORT_FILE_INVALID` | 400 | Import file format is invalid | Upload a .xlsx, .xls, or .csv file with proper headers. |
| `IMPORT_MAPPING_INCOMPLETE` | 400 | Field mapping is incomplete. Required fields are not mapped. | Map all required fields: {requiredFields}. |
| `IMPORT_PROFILE_NOT_FOUND` | 404 | Import profile not found | Verify the profile ID or create a new import profile. |
| `EXPORT_JOB_NOT_FOUND` | 404 | Export job does not exist | Verify the export job ID. |

### Workflow

| Code | HTTP | Message | Suggestion |
|------|------|---------|------------|
| `WORKFLOW_NOT_FOUND` | 404 | Workflow does not exist | Verify the workflow ID. |
| `WORKFLOW_INACTIVE` | 422 | This workflow is not active | Activate the workflow before it can trigger. |
| `WORKFLOW_EXECUTION_FAILED` | 500 | Workflow action execution failed | Check workflow action configuration. See execution logs for details. |

### Config & Credentials

| Code | HTTP | Message | Suggestion |
|------|------|---------|------------|
| `CONFIG_NOT_FOUND` | 404 | Configuration key not found | Verify the config key. Use GET /config to list all. |
| `CONFIG_READ_ONLY` | 403 | This configuration is read-only and cannot be modified | This is a system-managed config. Contact super admin if needed. |
| `CONFIG_VALIDATION_FAILED` | 400 | Configuration value does not meet validation rules | Check allowed values: {validationRule}. |
| `CREDENTIAL_NOT_FOUND` | 404 | Credential for this provider is not configured | Set up credentials in Settings > Integrations > {provider}. |
| `CREDENTIAL_EXPIRED` | 422 | API credential/token has expired | Re-authenticate or refresh the token in Settings > Integrations. |
| `CREDENTIAL_VERIFICATION_FAILED` | 422 | Credential verification failed — cannot connect to provider | Check the credentials. Error: {error}. |
| `CREDENTIAL_DAILY_LIMIT` | 429 | Daily API usage limit reached for this provider | Wait until tomorrow or increase the daily limit in settings. |
| `ENCRYPTION_FAILED` | 500 | Failed to encrypt/decrypt credential data | Check ENCRYPTION_MASTER_KEY in environment. Contact system admin. |

### Cron Jobs

| Code | HTTP | Message | Suggestion |
|------|------|---------|------------|
| `CRON_JOB_NOT_FOUND` | 404 | Cron job does not exist | Verify the job code. Use GET /admin/cron/jobs to list. |
| `CRON_JOB_ALREADY_RUNNING` | 409 | This cron job is currently running | Wait for the current execution to finish before running again. |
| `CRON_EXPRESSION_INVALID` | 400 | Invalid cron expression | Use standard 5-field cron format: "*/5 * * * *". See crontab.guru. |
| `CRON_HANDLER_NOT_REGISTERED` | 500 | No handler registered for this cron job code | Ensure the handler is implemented and registered in JobRegistryService. |

### Offline Sync

| Code | HTTP | Message | Suggestion |
|------|------|---------|------------|
| `SYNC_DIRECTION_NOT_ALLOWED` | 403 | Sync direction not allowed for this entity | Entity {entity} is set to {direction}. Contact admin to change policy. |
| `SYNC_ENTITY_DISABLED` | 403 | Offline sync is disabled for this entity | Contact admin to enable offline sync for {entity}. |
| `SYNC_CONFLICT_PENDING` | 409 | Sync conflict detected — manual resolution required | Use GET /sync/conflicts/{id} to view both versions and resolve. |
| `SYNC_DEVICE_BLOCKED` | 403 | This device has been blocked by admin | Contact your administrator. |
| `SYNC_FLUSH_PENDING` | 409 | A flush command is pending for this device | Execute the flush first, then re-download data. |
| `SYNC_STALE_DATA_BLOCKED` | 403 | Your offline data is too old. Sync required before any activity. | Connect to internet and sync your data. Stale since: {staleSince}. |

### Reports

| Code | HTTP | Message | Suggestion |
|------|------|---------|------------|
| `REPORT_NOT_FOUND` | 404 | Report definition not found | Verify the report code. Use GET /reports/definitions to list. |
| `REPORT_GENERATION_FAILED` | 500 | Failed to generate report | Check the date range and filters. Retry the request. |
| `REPORT_EXPORT_FAILED` | 500 | Failed to export report to the requested format | Try a different format (PDF/Excel/CSV). Check file size limits. |

## Usage Examples

### Throwing Errors in Services

```typescript
import { AppError } from '../common/errors';

// Simple error
throw AppError.from('LEAD_NOT_FOUND');

// With interpolation
throw AppError.from('PLAN_LIMIT_REACHED', { current: 500, limit: 500 });

// With details
throw AppError.from('VALIDATION_ERROR').withDetails([
  { field: 'email', message: 'must be a valid email' },
]);
```

### Handling Errors in Frontend

```typescript
const response = await fetch("/api/v1/leads/xyz");
const body = await response.json();

if (!body.success) {
  console.error(`Error ${body.error.code}: ${body.error.message}`);
  console.log(`Fix: ${body.error.suggestion}`);
  if (body.error.details) {
    // Handle field-level validation errors
    body.error.details.forEach(d => console.log(`${d.field}: ${d.message}`));
  }
}
```