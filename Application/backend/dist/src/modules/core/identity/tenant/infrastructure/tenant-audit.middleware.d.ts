import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantAuditService } from '../services/tenant-audit.service';
export declare class TenantAuditMiddleware implements NestMiddleware {
    private readonly auditService;
    constructor(auditService: TenantAuditService);
    use(req: Request, res: Response, next: NextFunction): void;
    private classifyAction;
    private extractEntity;
    private buildDescription;
    private redactBody;
    private detectDevice;
}
