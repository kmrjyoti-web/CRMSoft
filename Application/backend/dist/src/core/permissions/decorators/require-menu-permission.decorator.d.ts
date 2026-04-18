import type { PermissionAction } from '../../../modules/core/identity/menus/application/services/menu-permission.service';
export declare const MENU_PERMISSION_KEY = "menuPermission";
export interface MenuPermissionMeta {
    menuCode: string;
    action: PermissionAction;
    actions?: PermissionAction[];
    requireAll: boolean;
}
export declare function RequireMenuPermission(menuCode: string, action: PermissionAction | PermissionAction[], requireAll?: boolean): import("@nestjs/common").CustomDecorator<string>;
export declare const CanView: (menuCode: string) => import("@nestjs/common").CustomDecorator<string>;
export declare const CanCreate: (menuCode: string) => import("@nestjs/common").CustomDecorator<string>;
export declare const CanEdit: (menuCode: string) => import("@nestjs/common").CustomDecorator<string>;
export declare const CanDelete: (menuCode: string) => import("@nestjs/common").CustomDecorator<string>;
export declare const CanExport: (menuCode: string) => import("@nestjs/common").CustomDecorator<string>;
export declare const CanImport: (menuCode: string) => import("@nestjs/common").CustomDecorator<string>;
export declare const CanApprove: (menuCode: string) => import("@nestjs/common").CustomDecorator<string>;
export declare const CanAssign: (menuCode: string) => import("@nestjs/common").CustomDecorator<string>;
export declare const FullAccess: (menuCode: string) => import("@nestjs/common").CustomDecorator<string>;
