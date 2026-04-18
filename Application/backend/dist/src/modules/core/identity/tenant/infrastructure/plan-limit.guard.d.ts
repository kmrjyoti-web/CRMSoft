import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LimitCheckerService } from '../services/limit-checker.service';
export declare const CHECK_LIMIT_KEY = "checkLimit";
export declare class PlanLimitGuard implements CanActivate {
    private readonly reflector;
    private readonly limiter;
    constructor(reflector: Reflector, limiter: LimitCheckerService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
