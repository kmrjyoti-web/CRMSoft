import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LimitCheckerService } from '../services/limit-checker.service';
export declare const REQUIRE_FEATURE_KEY = "requireFeature";
export declare class FeatureFlagGuard implements CanActivate {
    private readonly reflector;
    private readonly limiter;
    constructor(reflector: Reflector, limiter: LimitCheckerService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
