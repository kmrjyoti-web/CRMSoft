import {
  Controller, Post, Delete, Get, Param, Body, UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { UbacEngine } from '../../../../core/permissions/engines/ubac.engine';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { GrantPermissionDto, DenyPermissionDto } from './dto/user-override.dto';

@Controller('user-overrides')
@RequirePermissions('permissions:manage')
export class UserOverridesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ubacEngine: UbacEngine,
  ) {}

  /** POST /:userId/grant — Grant permission to user */
  @Post(':userId/grant')
  async grant(
    @Param('userId') userId: string,
    @Body() dto: GrantPermissionDto,
    @CurrentUser('id') createdBy: string,
  ) {
    const existing = await this.prisma.userPermissionOverride.findFirst({
      where: { userId, action: dto.action, effect: 'grant' },
    });

    let override;
    if (existing) {
      override = await this.prisma.userPermissionOverride.update({
        where: { id: existing.id },
        data: {
          reason: dto.reason, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
          createdBy,
        },
      });
    } else {
      override = await this.prisma.userPermissionOverride.create({
        data: {
          userId, action: dto.action, effect: 'grant',
          reason: dto.reason, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
          createdBy,
        },
      });
    }
    this.ubacEngine.invalidateUser(userId);
    return ApiResponse.success(override, 'Permission granted');
  }

  /** POST /:userId/deny — Deny permission for user */
  @Post(':userId/deny')
  async deny(
    @Param('userId') userId: string,
    @Body() dto: DenyPermissionDto,
    @CurrentUser('id') createdBy: string,
  ) {
    const existingDeny = await this.prisma.userPermissionOverride.findFirst({
      where: { userId, action: dto.action, effect: 'deny' },
    });

    let override;
    if (existingDeny) {
      override = await this.prisma.userPermissionOverride.update({
        where: { id: existingDeny.id },
        data: {
          reason: dto.reason, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
          createdBy,
        },
      });
    } else {
      override = await this.prisma.userPermissionOverride.create({
        data: {
          userId, action: dto.action, effect: 'deny',
          reason: dto.reason, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
          createdBy,
        },
      });
    }
    this.ubacEngine.invalidateUser(userId);
    return ApiResponse.success(override, 'Permission denied');
  }

  /** DELETE /:userId/:action — Revoke override */
  @Delete(':userId/:action')
  async revoke(
    @Param('userId') userId: string,
    @Param('action') action: string,
  ) {
    const deleted = await this.prisma.userPermissionOverride.deleteMany({
      where: { userId, action },
    });
    this.ubacEngine.invalidateUser(userId);
    return ApiResponse.success({ removed: deleted.count }, 'Override revoked');
  }

  /** GET /:userId — Get all overrides for user */
  @Get(':userId')
  async getOverrides(@Param('userId') userId: string) {
    const overrides = await this.prisma.userPermissionOverride.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return ApiResponse.success(overrides);
  }

  /** GET / — List all overrides (admin view) */
  @Get()
  async listAll() {
    const overrides = await this.prisma.userPermissionOverride.findMany({
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return ApiResponse.success(overrides);
  }
}
