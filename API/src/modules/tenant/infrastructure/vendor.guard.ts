import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class VendorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user?.vendorId && user?.userType !== 'VENDOR') {
      throw new ForbiddenException('Vendor access required');
    }
    return true;
  }
}
