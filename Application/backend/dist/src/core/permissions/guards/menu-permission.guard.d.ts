import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MenuPermissionService } from '../../../modules/core/identity/menus/application/services/menu-permission.service';
export declare class MenuPermissionGuard implements CanActivate {
    private readonly reflector;
    private readonly menuPermissionService;
    private readonly logger;
    constructor(reflector: Reflector, menuPermissionService: MenuPermissionService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
