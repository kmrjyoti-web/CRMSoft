import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OwnershipEngine } from '../engines/ownership.engine';
export declare class OwnershipGuard implements CanActivate {
    private readonly reflector;
    private readonly ownershipEngine;
    constructor(reflector: Reflector, ownershipEngine: OwnershipEngine);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
