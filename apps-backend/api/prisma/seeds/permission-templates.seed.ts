import { PrismaClient } from '@prisma/identity-client';

interface TemplateSeed {
  name: string;
  code: string;
  description: string;
  isSystem: boolean;
  isDefault: boolean;
  permissions: Record<string, Record<string, boolean>>;
}

export const PERMISSION_TEMPLATES: TemplateSeed[] = [
  {
    name: 'Full Admin Access',
    code: 'FULL_ADMIN',
    description: 'Complete access to all modules and actions',
    isSystem: true,
    isDefault: false,
    permissions: {
      DASHBOARD: { canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true, canViewAll: true },
      CONTACTS: { canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true, canImport: true, canBulkUpdate: true, canBulkDelete: true, canViewAll: true, canEditAll: true, canDeleteAll: true },
      LEADS: { canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true, canImport: true, canAssign: true, canTransfer: true, canBulkUpdate: true, canBulkDelete: true, canViewAll: true, canEditAll: true, canDeleteAll: true },
      QUOTATIONS: { canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true, canApprove: true, canViewAll: true, canEditAll: true },
      MARKETPLACE_GROUP: { canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true, canViewAll: true, canEditAll: true },
      REPORTS_GROUP: { canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true },
      SETTINGS_GROUP: { canView: true, canCreate: true, canEdit: true, canDelete: true },
      USERS: { canView: true, canCreate: true, canEdit: true, canDelete: true },
      ROLES: { canView: true, canCreate: true, canEdit: true, canDelete: true },
      INVOICES: { canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true, canApprove: true, canViewAll: true },
      PAYMENTS: { canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true, canViewAll: true },
      ACTIVITIES: { canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true, canAssign: true, canViewAll: true },
      TICKETS: { canView: true, canCreate: true, canEdit: true, canDelete: true, canAssign: true, canViewAll: true },
    },
  },
  {
    name: 'Sales Manager',
    code: 'SALES_MANAGER',
    description: 'Manage sales team, leads, and quotations',
    isSystem: true,
    isDefault: false,
    permissions: {
      DASHBOARD: { canView: true, canExport: true },
      CONTACTS: { canView: true, canCreate: true, canEdit: true, canExport: true, canImport: true, canViewAll: true, canEditAll: true },
      LEADS: { canView: true, canCreate: true, canEdit: true, canExport: true, canAssign: true, canTransfer: true, canViewAll: true, canEditAll: true },
      QUOTATIONS: { canView: true, canCreate: true, canEdit: true, canExport: true, canApprove: true, canViewAll: true },
      MARKETPLACE_GROUP: { canView: true, canCreate: true, canEdit: true, canExport: true },
      REPORTS_GROUP: { canView: true, canExport: true },
      SETTINGS_GROUP: { canView: true },
      ACTIVITIES: { canView: true, canCreate: true, canEdit: true, canAssign: true, canViewAll: true },
      INVOICES: { canView: true, canCreate: true, canEdit: true, canExport: true, canViewAll: true },
    },
  },
  {
    name: 'Sales Executive',
    code: 'SALES_EXECUTIVE',
    description: 'Handle own leads and quotations',
    isSystem: true,
    isDefault: true,
    permissions: {
      DASHBOARD: { canView: true },
      CONTACTS: { canView: true, canCreate: true, canEdit: true },
      LEADS: { canView: true, canCreate: true, canEdit: true },
      QUOTATIONS: { canView: true, canCreate: true, canEdit: true },
      MARKETPLACE_GROUP: { canView: true, canCreate: true },
      REPORTS_GROUP: { canView: true },
      ACTIVITIES: { canView: true, canCreate: true, canEdit: true },
    },
  },
  {
    name: 'Read Only',
    code: 'READ_ONLY',
    description: 'View-only access to all modules',
    isSystem: true,
    isDefault: false,
    permissions: {
      DASHBOARD: { canView: true },
      CONTACTS: { canView: true },
      LEADS: { canView: true },
      QUOTATIONS: { canView: true },
      MARKETPLACE_GROUP: { canView: true },
      REPORTS_GROUP: { canView: true },
      INVOICES: { canView: true },
      PAYMENTS: { canView: true },
      ACTIVITIES: { canView: true },
    },
  },
  {
    name: 'Data Entry',
    code: 'DATA_ENTRY',
    description: 'Create and edit records, no delete',
    isSystem: true,
    isDefault: false,
    permissions: {
      CONTACTS: { canView: true, canCreate: true, canEdit: true, canImport: true },
      LEADS: { canView: true, canCreate: true, canEdit: true, canImport: true },
      QUOTATIONS: { canView: true, canCreate: true, canEdit: true },
      ACTIVITIES: { canView: true, canCreate: true, canEdit: true },
    },
  },
  {
    name: 'Approver',
    code: 'APPROVER',
    description: 'View and approve quotations and requests',
    isSystem: true,
    isDefault: false,
    permissions: {
      DASHBOARD: { canView: true },
      QUOTATIONS: { canView: true, canApprove: true, canViewAll: true },
      LEADS: { canView: true, canViewAll: true },
      INVOICES: { canView: true, canApprove: true, canViewAll: true },
    },
  },
];

export async function seedPermissionTemplates(prisma: PrismaClient) {
  let count = 0;
  for (const t of PERMISSION_TEMPLATES) {
    await prisma.permissionTemplate.upsert({
      where: { code: t.code },
      create: {
        name: t.name,
        code: t.code,
        description: t.description,
        tenantId: null,
        isSystem: t.isSystem,
        isDefault: t.isDefault,
        permissions: t.permissions,
      },
      update: {
        name: t.name,
        description: t.description,
        permissions: t.permissions,
        isDefault: t.isDefault,
      },
    });
    count++;
  }
  return count;
}
