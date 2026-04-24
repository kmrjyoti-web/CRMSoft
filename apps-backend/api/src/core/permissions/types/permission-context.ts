export interface PermissionContext {
  userId: string;
  roleId: string;
  roleName: string;
  roleLevel: number;
  departmentId?: string;
  departmentPath?: string;
  action: string;              // "leads:create", "contacts:delete"
  resourceType?: string;       // "lead", "contact", "quotation"
  resourceId?: string;
  attributes?: Record<string, any>;
}
