import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionChainService } from '../services/permission-chain.service';
export declare class PermissionPolicyGuard implements CanActivate {
    private readonly reflector;
    private readonly permissionChain;
    private readonly logger;
    constructor(reflector: Reflector, permissionChain: PermissionChainService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
