import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../../common/utils/api-response';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List permissions (filtered by tenant menus)' })
  async findAll(@Req() req: any) {
    const tenantId = req.user?.tenantId;

    // Get module codes used by this tenant's menus
    let activeModules: string[] | null = null;
    if (tenantId) {
      const menus = await this.prisma.menu.findMany({
        where: { tenantId, isActive: true, permissionModule: { not: null } },
        select: { permissionModule: true },
        distinct: ['permissionModule'],
      });
      activeModules = menus
        .map((m) => m.permissionModule!)
        .filter(Boolean);
    }

    const where = activeModules && activeModules.length > 0
      ? { module: { in: activeModules } }
      : {};

    const permissions = await this.prisma.permission.findMany({
      where,
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });
    return ApiResponse.success(permissions);
  }

  @Get('matrix')
  @ApiOperation({ summary: 'Get permission matrix (role → permission IDs) for current tenant' })
  async getMatrix(@Req() req: any) {
    const tenantId = req.user?.tenantId;

    // Only fetch rolePermissions for this tenant's roles
    const where: any = {};
    if (tenantId) {
      const roles = await this.prisma.role.findMany({
        where: { tenantId },
        select: { id: true },
      });
      const roleIds = roles.map((r) => r.id);
      where.roleId = { in: roleIds };
    }

    const rolePerms = await this.prisma.rolePermission.findMany({
      where,
      select: { roleId: true, permissionId: true },
    });
    const matrix: Record<string, string[]> = {};
    for (const rp of rolePerms) {
      if (!matrix[rp.roleId]) matrix[rp.roleId] = [];
      matrix[rp.roleId].push(rp.permissionId);
    }
    return ApiResponse.success(matrix);
  }
}
