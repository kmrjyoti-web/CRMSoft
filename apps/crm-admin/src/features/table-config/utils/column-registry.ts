import type { ColumnConfig } from "../types/table-config.types";

/**
 * System default columns for every table.
 * These are the fallback when no user/tenant config exists.
 */
export const COLUMN_REGISTRY: Record<string, ColumnConfig[]> = {
  contacts: [
    { id: "name", label: "Name", visible: true, order: 0 },
    { id: "email", label: "Email", visible: true, order: 1 },
    { id: "phone", label: "Phone", visible: true, order: 2 },
    { id: "designation", label: "Designation", visible: true, order: 3 },
    { id: "organization", label: "Organization", visible: true, order: 4 },
    { id: "verify", label: "ID Verify", visible: true, order: 5 },
    { id: "status", label: "Status", visible: true, order: 6 },
    { id: "createdAt", label: "Created", visible: true, order: 7 },
    { id: "rowActions", label: "Actions", visible: true, order: 8 },
  ],
  organizations: [
    { id: "name", label: "Name", visible: true, order: 0 },
    { id: "industry", label: "Industry", visible: true, order: 1 },
    { id: "city", label: "City", visible: true, order: 2 },
    { id: "phone", label: "Phone", visible: true, order: 3 },
    { id: "website", label: "Website", visible: true, order: 4 },
    { id: "verify", label: "ID Verify", visible: true, order: 5 },
    { id: "status", label: "Status", visible: true, order: 6 },
    { id: "createdAt", label: "Created", visible: true, order: 7 },
    { id: "rowActions", label: "Actions", visible: true, order: 8 },
  ],
  leads: [
    { id: "leadNumber", label: "Lead #", visible: true, order: 0 },
    { id: "contactName", label: "Contact", visible: true, order: 1 },
    { id: "organization", label: "Organization", visible: true, order: 2 },
    { id: "status", label: "Status", visible: true, order: 3 },
    { id: "priority", label: "Priority", visible: true, order: 4 },
    { id: "active", label: "Active", visible: true, order: 5 },
    { id: "allocatedTo", label: "Assignee", visible: true, order: 6 },
    { id: "createdAt", label: "Created", visible: true, order: 7 },
  ],
  activities: [
    { id: "type", label: "Type", visible: true, order: 0 },
    { id: "subject", label: "Subject", visible: true, order: 1 },
    { id: "lead", label: "Lead", visible: true, order: 2 },
    { id: "contact", label: "Contact", visible: true, order: 3 },
    { id: "scheduledAt", label: "Scheduled At", visible: true, order: 4 },
    { id: "duration", label: "Duration", visible: true, order: 5 },
    { id: "active", label: "Active", visible: true, order: 6 },
    { id: "outcome", label: "Outcome", visible: false, order: 7 },
    { id: "createdAt", label: "Created", visible: false, order: 8 },
  ],
  "raw-contacts": [
    { id: "name", label: "Name", visible: true, order: 0 },
    { id: "companyName", label: "Company", visible: true, order: 1 },
    { id: "email", label: "Email", visible: true, order: 2 },
    { id: "phone", label: "Phone", visible: true, order: 3 },
    { id: "source", label: "Source", visible: true, order: 4 },
    { id: "status", label: "Status", visible: true, order: 5 },
    { id: "verify", label: "ID Verify", visible: true, order: 6 },
    { id: "active", label: "Active", visible: true, order: 7 },
    { id: "designation", label: "Designation", visible: false, order: 8 },
    { id: "department", label: "Department", visible: false, order: 9 },
    { id: "createdAt", label: "Created", visible: true, order: 10 },
    { id: "rowActions", label: "Actions", visible: true, order: 11 },
  ],
  documents: [
    { id: "originalName", label: "File Name", visible: true, order: 0 },
    { id: "category", label: "Category", visible: true, order: 1 },
    { id: "fileSize", label: "Size", visible: true, order: 2 },
    { id: "storageType", label: "Storage", visible: true, order: 3 },
    { id: "version", label: "Version", visible: true, order: 4 },
    { id: "folder", label: "Folder", visible: true, order: 5 },
    { id: "uploadedBy", label: "Uploaded By", visible: true, order: 6 },
    { id: "status", label: "Status", visible: true, order: 7 },
    { id: "createdAt", label: "Created", visible: true, order: 8 },
  ],
  users: [
    { id: "name", label: "Name", visible: true, order: 0 },
    { id: "email", label: "Email", visible: true, order: 1 },
    { id: "phone", label: "Phone", visible: true, order: 2 },
    { id: "role", label: "Role", visible: true, order: 3 },
    { id: "userType", label: "Type", visible: true, order: 4 },
    { id: "status", label: "Status", visible: true, order: 5 },
    { id: "createdAt", label: "Created", visible: false, order: 6 },
  ],
};

/**
 * Get system default columns for a table key.
 */
export function getDefaultColumns(tableKey: string): ColumnConfig[] {
  return COLUMN_REGISTRY[tableKey] ?? [];
}
