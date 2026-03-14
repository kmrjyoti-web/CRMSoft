import {
  Injectable, CanActivate, ExecutionContext, ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Allow SuperAdmin or Vendor (vendor IS the platform admin)
    if (!user?.isSuperAdmin && !user?.vendorId && user?.userType !== 'VENDOR') {
      throw new ForbiddenException('Platform admin access required');
    }

    return true;
  }
}
