import { Injectable, Logger } from '@nestjs/common';
import { RbacEngine } from '../engines/rbac.engine';
import { UbacEngine } from '../engines/ubac.engine';
import { RoleHierarchyEngine } from '../engines/role-hierarchy.engine';
import { DeptHierarchyEngine } from '../engines/dept-hierarchy.engine';
import { OwnershipEngine } from '../engines/ownership.engine';
import { MakerCheckerEngine } from '../engines/maker-checker.engine';
import { PermissionContext } from '../types/permission-context';
import { PermissionResult } from '../types/permission-result';
import { PermissionError, ApprovalRequiredError } from '../types/permission-error';

/**
 * Permission Chain Service — orchestrates the 7-step permission evaluation.
 *
 * Step 1: UBAC DENY   → explicit user deny override
 * Step 2: RBAC        → role permission check (with wildcards)
 * Step 3: ROLE HIER   → role level inheritance check
 * Step 4: DEPT HIER   → department path access check
 * Step 5: OWNERSHIP   → entity ownership check (ReBAC)
 * Step 6: UBAC GRANT  → explicit user grant override (rescue)
 * Step 7: MAKER-CHECKER → approval workflow (attach info)
 */
@Injectable()
export class PermissionChainService {
  private readonly logger = new Logger(PermissionChainService.name);

  constructor(
    private readonly rbacEngine: RbacEngine,
    private readonly ubacEngine: UbacEngine,
    private readonly roleHierarchyEngine: RoleHierarchyEngine,
    private readonly deptHierarchyEngine: DeptHierarchyEngine,
    private readonly ownershipEngine: OwnershipEngine,
    private readonly makerCheckerEngine: MakerCheckerEngine,
  ) {}

  /** Run the full 7-step permission chain. */
  async can(ctx: PermissionContext): Promise<PermissionResult> {
    this.logger.debug(`Evaluating: ${ctx.action} for user ${ctx.userId}`);

    // Step 1: UBAC DENY
    if (await this.ubacEngine.hasExplicitDeny(ctx)) {
      return { allowed: false, reason: 'UBAC_DENIED', deniedBy: 'UBAC' };
    }

    // Steps 2–5: Track first failure for UBAC GRANT rescue
    let failure: PermissionResult | null = null;

    // Step 2: RBAC
    if (!(await this.rbacEngine.check(ctx))) {
      failure = { allowed: false, reason: 'RBAC_DENIED', deniedBy: 'RBAC' };
    }

    // Step 3: Role Hierarchy (only if RBAC passed)
    if (!failure && !(await this.roleHierarchyEngine.check(ctx))) {
      failure = { allowed: false, reason: 'ROLE_LEVEL_DENIED', deniedBy: 'ROLE_HIERARCHY' };
    }

    // Step 4: Department Hierarchy (only if prior passed)
    if (!failure && !(await this.deptHierarchyEngine.check(ctx))) {
      failure = { allowed: false, reason: 'DEPT_HIERARCHY_DENIED', deniedBy: 'DEPT_HIERARCHY' };
    }

    // Step 5: Ownership (only if prior passed)
    if (!failure && !(await this.ownershipEngine.check(ctx))) {
      failure = { allowed: false, reason: 'OWNERSHIP_DENIED', deniedBy: 'OWNERSHIP' };
    }

    // Step 6: UBAC GRANT (rescue)
    if (failure) {
      if (await this.ubacEngine.hasExplicitGrant(ctx)) {
        this.logger.debug(`UBAC GRANT rescued denial: ${failure.reason}`);
        failure = null; // rescued
      } else {
        this.logger.debug(`Denied: ${failure.reason} [${failure.deniedBy}]`);
        return failure;
      }
    }

    // Step 7: Maker-Checker
    const approval = await this.makerCheckerEngine.requiresApproval(ctx);
    if (approval.required) {
      return {
        allowed: true,
        makerChecker: {
          requiresApproval: true,
          checkerRole: approval.checkerRole,
        },
      };
    }

    return { allowed: true };
  }

  /** Run chain; throw PermissionError if denied. Returns maker-checker info if applicable. */
  async canOrThrow(ctx: PermissionContext): Promise<PermissionResult['makerChecker'] | null> {
    const result = await this.can(ctx);
    if (!result.allowed) {
      throw new PermissionError(result.reason!, ctx.action, result.deniedBy);
    }
    return result.makerChecker || null;
  }

  /** Check if ALL contexts pass. */
  async canAll(contexts: PermissionContext[]): Promise<boolean> {
    for (const ctx of contexts) {
      const result = await this.can(ctx);
      if (!result.allowed) return false;
    }
    return true;
  }

  /** Check if ANY context passes. */
  async canAny(contexts: PermissionContext[]): Promise<boolean> {
    for (const ctx of contexts) {
      const result = await this.can(ctx);
      if (result.allowed) return true;
    }
    return false;
  }

  /** Get all effective permissions for a user (delegates to RoleHierarchyEngine). */
  async getEffectivePermissions(userId: string): Promise<string[]> {
    return this.roleHierarchyEngine.getEffectivePermissions(userId);
  }

  /** Invalidate all engine caches. */
  invalidateAll(): void {
    this.rbacEngine.invalidateAll();
    this.ubacEngine.invalidateAll();
    this.roleHierarchyEngine.invalidateAll();
  }
}
