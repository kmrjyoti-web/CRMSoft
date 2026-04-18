export interface PermissionContext {
    userId: string;
    roleId: string;
    roleName: string;
    roleLevel: number;
    departmentId?: string;
    departmentPath?: string;
    action: string;
    resourceType?: string;
    resourceId?: string;
    attributes?: Record<string, any>;
}
