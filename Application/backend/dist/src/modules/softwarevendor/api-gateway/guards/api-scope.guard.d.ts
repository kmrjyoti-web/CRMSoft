import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ScopeCheckerService } from '../services/scope-checker.service';
export declare class ApiScopeGuard implements CanActivate {
    private readonly reflector;
    private readonly scopeChecker;
    constructor(reflector: Reflector, scopeChecker: ScopeCheckerService);
    canActivate(context: ExecutionContext): boolean;
}
