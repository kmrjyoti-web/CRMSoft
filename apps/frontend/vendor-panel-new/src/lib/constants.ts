export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'CRMSoft Dev Portal';

// ─── Kept Features ───

export const MODULE_STATUS = [
  { value: 'ACTIVE', label: 'Active', color: 'green' },
  { value: 'INACTIVE', label: 'Inactive', color: 'gray' },
  { value: 'DEPRECATED', label: 'Deprecated', color: 'red' },
] as const;

export const MODULE_CATEGORIES = [
  { value: 'CORE', label: 'Core' },
  { value: 'ADDON', label: 'Add-on' },
  { value: 'INTEGRATION', label: 'Integration' },
  { value: 'ANALYTICS', label: 'Analytics' },
  { value: 'COMMUNICATION', label: 'Communication' },
] as const;

export const PACKAGE_STATUS = [
  { value: 'ACTIVE', label: 'Active', color: 'green' },
  { value: 'INACTIVE', label: 'Inactive', color: 'gray' },
  { value: 'ARCHIVED', label: 'Archived', color: 'red' },
] as const;

export const LICENSE_STATUS = [
  { value: 'ACTIVE', label: 'Active', color: 'green' },
  { value: 'TRIAL', label: 'Trial', color: 'blue' },
  { value: 'EXPIRED', label: 'Expired', color: 'red' },
  { value: 'SUSPENDED', label: 'Suspended', color: 'orange' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'gray' },
] as const;

export const PARTNER_STATUS = [
  { value: 'ACTIVE', label: 'Active', color: 'green' },
  { value: 'INACTIVE', label: 'Inactive', color: 'gray' },
  { value: 'PENDING', label: 'Pending', color: 'yellow' },
  { value: 'SUSPENDED', label: 'Suspended', color: 'red' },
] as const;

export const PARTNER_TYPES = [
  { value: 'RESELLER', label: 'Reseller' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'AFFILIATE', label: 'Affiliate' },
  { value: 'STRATEGIC', label: 'Strategic' },
] as const;

export const TRANSACTION_TYPES = [
  { value: 'CREDIT', label: 'Credit', color: 'green' },
  { value: 'DEBIT', label: 'Debit', color: 'red' },
] as const;

// ─── Dev-Ops Constants ───

export const ERROR_SEVERITY = [
  { value: 'INFO', label: 'Info', color: 'blue' },
  { value: 'WARNING', label: 'Warning', color: 'yellow' },
  { value: 'ERROR', label: 'Error', color: 'red' },
  { value: 'CRITICAL', label: 'Critical', color: 'purple' },
] as const;

export const AUDIT_ACTIONS = [
  { value: 'CREATE', label: 'Create', color: 'green' },
  { value: 'UPDATE', label: 'Update', color: 'blue' },
  { value: 'DELETE', label: 'Delete', color: 'red' },
  { value: 'LOGIN', label: 'Login', color: 'purple' },
  { value: 'EXPORT', label: 'Export', color: 'orange' },
  { value: 'IMPORT', label: 'Import', color: 'teal' },
] as const;

export const SERVICE_STATUS = [
  { value: 'HEALTHY', label: 'Healthy', color: 'green' },
  { value: 'DEGRADED', label: 'Degraded', color: 'yellow' },
  { value: 'DOWN', label: 'Down', color: 'red' },
] as const;

export const TENANT_STATUS = [
  { value: 'ACTIVE', label: 'Active', color: 'green' },
  { value: 'TRIAL', label: 'Trial', color: 'blue' },
  { value: 'SUSPENDED', label: 'Suspended', color: 'red' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'gray' },
] as const;

export const DEV_REQUEST_STATUS = [
  { value: 'OPEN', label: 'Open', color: 'blue' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'yellow' },
  { value: 'IN_REVIEW', label: 'In Review', color: 'purple' },
  { value: 'DEPLOYED', label: 'Deployed', color: 'green' },
  { value: 'CLOSED', label: 'Closed', color: 'gray' },
] as const;

export const DEV_REQUEST_PRIORITY = [
  { value: 'LOW', label: 'Low', color: 'gray' },
  { value: 'MEDIUM', label: 'Medium', color: 'blue' },
  { value: 'HIGH', label: 'High', color: 'orange' },
  { value: 'CRITICAL', label: 'Critical', color: 'red' },
] as const;

export const DEV_REQUEST_TYPE = [
  { value: 'FEATURE', label: 'Feature' },
  { value: 'BUG', label: 'Bug' },
  { value: 'CUSTOMIZATION', label: 'Customization' },
  { value: 'SUPPORT', label: 'Support' },
] as const;

export const DB_STRATEGY = [
  { value: 'GLOBAL', label: 'Global', color: 'blue' },
  { value: 'INDEPENDENT', label: 'Independent', color: 'purple' },
] as const;

export const DB_STATUS = [
  { value: 'HEALTHY', label: 'Healthy', color: 'green' },
  { value: 'NEEDS_REPAIR', label: 'Needs Repair', color: 'red' },
  { value: 'MIGRATING', label: 'Migrating', color: 'yellow' },
] as const;
