import { RbacEngine } from '../engines/rbac.engine';
import { UbacEngine } from '../engines/ubac.engine';
import { RoleHierarchyEngine } from '../engines/role-hierarchy.engine';
import { DeptHierarchyEngine } from '../engines/dept-hierarchy.engine';
import { OwnershipEngine } from '../engines/ownership.engine';
import { MakerCheckerEngine } from '../engines/maker-checker.engine';
import { PermissionContext } from '../types/permission-context';
import { PermissionResult } from '../types/permission-result';
export declare class PermissionChainService {
    private readonly rbacEngine;
    private readonly ubacEngine;
    private readonly roleHierarchyEngine;
    private readonly deptHierarchyEngine;
    private readonly ownershipEngine;
    private readonly makerCheckerEngine;
    private readonly logger;
    constructor(rbacEngine: RbacEngine, ubacEngine: UbacEngine, roleHierarchyEngine: RoleHierarchyEngine, deptHierarchyEngine: DeptHierarchyEngine, ownershipEngine: OwnershipEngine, makerCheckerEngine: MakerCheckerEngine);
    can(ctx: PermissionContext): Promise<PermissionResult>;
    canOrThrow(ctx: PermissionContext): Promise<PermissionResult['makerChecker'] | null>;
    canAll(contexts: PermissionContext[]): Promise<boolean>;
    canAny(contexts: PermissionContext[]): Promise<boolean>;
    getEffectivePermissions(userId: string): Promise<string[]>;
    getAllPermissionCodes(): Promise<string[]>;
    invalidateAll(): void;
}
