import { SetMetadata } from '@nestjs/common';
import type { PermissionAction } from '../../../modules/core/menus/application/services/menu-permission.service';

export const MENU_PERMISSION_KEY = 'menuPermission';

export interface MenuPermissionMeta {
  menuCode: string;
  action: PermissionAction;
  /** Multiple actions (overrides single action). */
  actions?: PermissionAction[];
  /** Require ALL actions (true, default) or ANY (false). */
  requireAll: boolean;
}

/**
 * Require specific menu-level permission(s).
 *
 * @example
 *   // Single action
 *   @RequireMenuPermission('contacts', 'create')
 *
 *   // Multiple actions (require ALL by default)
 *   @RequireMenuPermission('contacts', ['view', 'edit'])
 *
 *   // Multiple actions (require ANY)
 *   @RequireMenuPermission('contacts', ['edit', 'delete'], false)
 */
export function RequireMenuPermission(
  menuCode: string,
  action: PermissionAction | PermissionAction[],
  requireAll = true,
) {
  const meta: MenuPermissionMeta = {
    menuCode,
    action: Array.isArray(action) ? action[0] : action,
    actions: Array.isArray(action) ? action : undefined,
    requireAll,
  };
  return SetMetadata(MENU_PERMISSION_KEY, meta);
}

/** Shorthand: require canView on menu. */
export const CanView = (menuCode: string) => RequireMenuPermission(menuCode, 'view');
/** Shorthand: require canCreate on menu. */
export const CanCreate = (menuCode: string) => RequireMenuPermission(menuCode, 'create');
/** Shorthand: require canEdit on menu. */
export const CanEdit = (menuCode: string) => RequireMenuPermission(menuCode, 'edit');
/** Shorthand: require canDelete on menu. */
export const CanDelete = (menuCode: string) => RequireMenuPermission(menuCode, 'delete');
/** Shorthand: require canExport on menu. */
export const CanExport = (menuCode: string) => RequireMenuPermission(menuCode, 'export');
/** Shorthand: require canImport on menu. */
export const CanImport = (menuCode: string) => RequireMenuPermission(menuCode, 'import');
/** Shorthand: require canApprove on menu. */
export const CanApprove = (menuCode: string) => RequireMenuPermission(menuCode, 'approve');
/** Shorthand: require canAssign on menu. */
export const CanAssign = (menuCode: string) => RequireMenuPermission(menuCode, 'assign');

/** Require all four CRUD permissions. */
export const FullAccess = (menuCode: string) =>
  RequireMenuPermission(menuCode, ['view', 'create', 'edit', 'delete']);
