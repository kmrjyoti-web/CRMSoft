import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class PartnerGuard implements CanActivate {
    canActivate(ctx: ExecutionContext): boolean;
}
