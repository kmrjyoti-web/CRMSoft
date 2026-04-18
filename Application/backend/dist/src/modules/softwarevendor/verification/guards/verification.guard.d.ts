import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { VerificationService } from '../services/verification.service';
export declare class VerificationGuard implements CanActivate {
    private readonly reflector;
    private readonly verificationService;
    constructor(reflector: Reflector, verificationService: VerificationService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private getErrorMessage;
}
