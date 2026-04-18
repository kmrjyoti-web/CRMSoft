import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleAccessService } from '../services/module-access.service';
export declare const REQUIRE_MODULE_KEY = "requiredModule";
export declare class ModuleAccessGuard implements CanActivate {
    private readonly reflector;
    private readonly moduleAccessService;
    constructor(reflector: Reflector, moduleAccessService: ModuleAccessService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
