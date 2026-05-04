import {
  Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../core/prisma/prisma.service';

export const REQUIRE_BUSINESS_MODE_KEY = 'requireBusinessMode';

/** Route requires user's active company to have at least one of the specified business modes. */
export const RequireBusinessMode = (...modes: string[]) =>
  SetMetadata(REQUIRE_BUSINESS_MODE_KEY, modes);

@Injectable()
export class BusinessModeGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.get<string[]>(REQUIRE_BUSINESS_MODE_KEY, context.getHandler());
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const companyId: string | null | undefined = req.user?.companyId;

    if (!companyId) {
      throw new ForbiddenException({
        error: 'BUSINESS_MODE_REQUIRED',
        message: `This action requires an active company with one of these business modes: ${required.join(', ')}`,
        requiredModes: required,
      });
    }

    const mapping = await (this.prisma.identity as any).userCompanyMapping.findFirst({
      where: { userId: req.user.sub, companyId, status: 'ACTIVE', isDeleted: false },
      select: { selectedBusinessModes: true },
    });

    const modesJson = mapping?.selectedBusinessModes;
    const userModes: string[] =
      Array.isArray(modesJson) ? modesJson :
      (modesJson && typeof modesJson === 'object' && Array.isArray((modesJson as any).modes))
        ? (modesJson as any).modes
        : [];

    const hasMode = required.some((m) => userModes.includes(m));

    if (!hasMode) {
      throw new ForbiddenException({
        error: 'BUSINESS_MODE_REQUIRED',
        message: `This action requires ${required.join(' or ')} business mode. Your current modes: ${userModes.length > 0 ? userModes.join(', ') : 'none'}`,
        requiredModes: required,
        userModes,
      });
    }

    return true;
  }
}
