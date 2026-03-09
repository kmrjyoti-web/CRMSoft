import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../common/utils/api-response';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List all permissions' })
  async findAll() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });
    return ApiResponse.success(permissions);
  }

  @Get('matrix')
  @ApiOperation({ summary: 'Get permission matrix (role → permission IDs)' })
  async getMatrix() {
    const rolePerms = await this.prisma.rolePermission.findMany({
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
