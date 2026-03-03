import {
  Injectable, CanActivate, ExecutionContext, ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const USER_TYPES_KEY = 'userTypes';

@Injectable()
export class UserTypeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTypes = this.reflector.getAllAndOverride<string[]>(
      USER_TYPES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredTypes) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Access denied');

    if (!requiredTypes.includes(user.userType)) {
      throw new ForbiddenException(
        `This endpoint requires userType: ${requiredTypes.join(' or ')}`,
      );
    }
    return true;
  }
}
