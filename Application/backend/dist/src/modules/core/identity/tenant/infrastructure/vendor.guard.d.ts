import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class VendorGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
