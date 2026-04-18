import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeyService } from '../services/api-key.service';
export declare class ApiKeyGuard implements CanActivate {
    private readonly reflector;
    private readonly apiKeyService;
    private readonly logger;
    constructor(reflector: Reflector, apiKeyService: ApiKeyService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
