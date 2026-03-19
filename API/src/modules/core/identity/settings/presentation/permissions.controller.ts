import { Controller, Get, Query, Req } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { ListPermissionsQuery } from '../application/queries/list-permissions/list-permissions.query';
import { ApiResponse } from '../../../../../common/utils/api-response';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List permissions (optionally filtered by module)' })
  async findAll(@Query('module') module?: string, @Query('search') search?: string) {
    const permissions = await this.queryBus.execute(new ListPermissionsQuery(module, search));
    return ApiResponse.success(permissions);
  }

  @Get('matrix')
  @ApiOperation({ summary: 'Get permission matrix (role → permission IDs) for current tenant' })
  async getMatrix(@Req() req: any) {
    const tenantId = req.user?.tenantId;

    const where: any = {};
    if (tenantId) {
      const roles = await this.prisma.identity.role.findMany({
        where: { tenantId },
        select: { id: true },
      });
      const roleIds = roles.map((r) => r.id);
      where.roleId = { in: roleIds };
    }

    const rolePerms = await this.prisma.identity.rolePermission.findMany({
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
