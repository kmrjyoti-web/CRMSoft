import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
@Injectable()
export class PartnerGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const user = ctx.switchToHttp().getRequest().user;
    if (!['MASTER_ADMIN', 'PARTNER'].includes(user?.role)) throw new ForbiddenException('Partner access only');
    return true;
  }
}
