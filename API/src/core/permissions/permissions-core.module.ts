import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RbacEngine } from './engines/rbac.engine';
import { UbacEngine } from './engines/ubac.engine';
import { RoleHierarchyEngine } from './engines/role-hierarchy.engine';
import { DeptHierarchyEngine } from './engines/dept-hierarchy.engine';
import { OwnershipEngine } from './engines/ownership.engine';
import { MakerCheckerEngine } from './engines/maker-checker.engine';
import { PermissionChainService } from './services/permission-chain.service';
import { PermissionCacheService } from './services/permission-cache.service';
import { PermissionPolicyGuard } from './guards/permission-policy.guard';
import { OwnershipGuard } from './guards/ownership.guard';

@Global()
@Module({
  providers: [
    RbacEngine,
    UbacEngine,
    RoleHierarchyEngine,
    DeptHierarchyEngine,
    OwnershipEngine,
    MakerCheckerEngine,
    PermissionChainService,
    PermissionCacheService,
    PermissionPolicyGuard,
    OwnershipGuard,
    { provide: APP_GUARD, useClass: PermissionPolicyGuard },
  ],
  exports: [
    RbacEngine,
    UbacEngine,
    RoleHierarchyEngine,
    DeptHierarchyEngine,
    OwnershipEngine,
    MakerCheckerEngine,
    PermissionChainService,
    PermissionCacheService,
    PermissionPolicyGuard,
    OwnershipGuard,
  ],
})
export class PermissionsCoreModule {}
