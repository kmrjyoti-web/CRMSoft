import {
  Controller, Get, Put, Post, Delete, Param, Body, Query, HttpCode,
} from '@nestjs/common';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import {
  MenuPermissionService,
  MenuPermissions,
  PermissionAction,
} from '../application/services/menu-permission.service';

@Controller('menu-permissions')
export class MenuPermissionController {
  constructor(
    private readonly menuPermissionService: MenuPermissionService,
    private readonly prisma: PrismaService,
  ) {}

  // ═══════════════════════════════════════════════════════
  // GET PERMISSIONS
  // ═══════════════════════════════════════════════════════

  /** GET /role/:roleId — All permissions for a role. */
  @Get('role/:roleId')
  @RequirePermissions('roles:read')
  async getRolePermissions(
    @Param('roleId') roleId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const perms = await this.menuPermissionService.getAllPermissionsForRole(tenantId, roleId);
    return ApiResponse.success(Array.from(perms.values()));
  }

  /** GET /role/:roleId/menu/:menuCode — Permission for specific menu. */
  @Get('role/:roleId/menu/:menuCode')
  @RequirePermissions('roles:read')
  async getMenuPermission(
    @Param('roleId') roleId: string,
    @Param('menuCode') menuCode: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const perm = await this.menuPermissionService.getPermissions(tenantId, roleId, menuCode);
    return ApiResponse.success(perm);
  }

  /** GET /matrix/:roleId — Permission matrix for a single role. */
  @Get('matrix/:roleId')
  @RequirePermissions('roles:read')
  async getMatrix(
    @Param('roleId') roleId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const matrix = await this.menuPermissionService.getMatrix(tenantId, roleId);
    return ApiResponse.success(matrix);
  }

  /** GET /matrix — Full permission matrix for ALL roles. */
  @Get('matrix')
  @RequirePermissions('roles:read')
  async getFullMatrix(@CurrentUser('tenantId') tenantId: string) {
    const matrix = await this.menuPermissionService.getFullMatrix(tenantId);
    return ApiResponse.success(matrix);
  }

  // ═══════════════════════════════════════════════════════
  // SET PERMISSIONS
  // ═══════════════════════════════════════════════════════

  /** PUT /role/:roleId/menu/:menuId — Set permissions for a menu. */
  @Put('role/:roleId/menu/:menuId')
  @RequirePermissions('roles:update')
  async setMenuPermission(
    @Param('roleId') roleId: string,
    @Param('menuId') menuId: string,
    @Body() body: { menuCode: string } & Partial<MenuPermissions>,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    const { menuCode, ...permissions } = body;
    const result = await this.menuPermissionService.setPermissions(
      tenantId, roleId, menuId, menuCode, permissions, userId,
    );
    return ApiResponse.success(result, 'Menu permission updated');
  }

  /** PUT /role/:roleId/bulk — Bulk set permissions (save full matrix). */
  @Put('role/:roleId/bulk')
  @RequirePermissions('roles:update')
  async bulkSet(
    @Param('roleId') roleId: string,
    @Body() body: {
      permissions: Array<{
        menuId: string;
        menuCode: string;
        permissions: Partial<MenuPermissions>;
      }>;
    },
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    const count = await this.menuPermissionService.bulkSetPermissions(
      tenantId, roleId, body.permissions, userId,
    );
    return ApiResponse.success({ count }, `${count} menu permissions updated`);
  }

  /** POST /copy — Copy permissions from one role to another. */
  @Post('copy')
  @RequirePermissions('roles:update')
  @HttpCode(200)
  async copy(
    @Body() body: { sourceRoleId: string; targetRoleId: string },
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    const count = await this.menuPermissionService.copyPermissions(
      tenantId, body.sourceRoleId, body.targetRoleId, userId,
    );
    return ApiResponse.success({ count }, `${count} permissions copied`);
  }

  // ═══════════════════════════════════════════════════════
  // TEMPLATES
  // ═══════════════════════════════════════════════════════

  /** GET /templates — List all permission templates. */
  @Get('templates')
  @RequirePermissions('roles:read')
  async getTemplates(@CurrentUser('tenantId') tenantId: string) {
    const templates = await this.menuPermissionService.getTemplates(tenantId);
    return ApiResponse.success(templates);
  }

  /** POST /templates — Create a custom permission template. */
  @Post('templates')
  @RequirePermissions('roles:update')
  async createTemplate(
    @Body() body: {
      name: string;
      code: string;
      description?: string;
      permissions: Record<string, Partial<MenuPermissions>>;
    },
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const template = await this.prisma.permissionTemplate.create({
      data: {
        tenantId,
        name: body.name,
        code: body.code,
        description: body.description,
        permissions: body.permissions,
      },
    });
    return ApiResponse.success(template, 'Template created');
  }

  /** POST /templates/apply — Apply a template to a role. */
  @Post('templates/apply')
  @RequirePermissions('roles:update')
  @HttpCode(200)
  async applyTemplate(
    @Body() body: { roleId: string; templateId: string },
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    const count = await this.menuPermissionService.applyTemplate(
      tenantId, body.roleId, body.templateId, userId,
    );
    return ApiResponse.success({ count }, `Template applied to ${count} menus`);
  }

  // ═══════════════════════════════════════════════════════
  // CHECK
  // ═══════════════════════════════════════════════════════

  /** GET /check — Check current user's permission on a menu. */
  @Get('check')
  async checkPermission(
    @Query('menuCode') menuCode: string,
    @Query('action') action: string,
    @CurrentUser() user: any,
  ) {
    const allowed = await this.menuPermissionService.hasPermission(
      user.tenantId, user.roleId, menuCode,
      action as PermissionAction,
      user.role || user.roleName,
    );
    return ApiResponse.success({ allowed, menuCode, action });
  }

  /** GET /restricted-fields — Get restricted fields for a menu. */
  @Get('restricted-fields')
  async getRestrictedFields(
    @Query('menuCode') menuCode: string,
    @CurrentUser() user: any,
  ) {
    const fields = await this.menuPermissionService.getRestrictedFields(
      user.tenantId, user.roleId, menuCode,
    );
    return ApiResponse.success(fields);
  }

  // ═══════════════════════════════════════════════════════
  // DELETE
  // ═══════════════════════════════════════════════════════

  /** DELETE /role/:roleId — Delete all permissions for a role. */
  @Delete('role/:roleId')
  @RequirePermissions('roles:update')
  async deleteRolePermissions(
    @Param('roleId') roleId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const count = await this.menuPermissionService.deleteRolePermissions(tenantId, roleId);
    return ApiResponse.success({ count }, `${count} menu permissions deleted`);
  }

  /** DELETE /role/:roleId/menu/:menuId — Delete specific menu permission. */
  @Delete('role/:roleId/menu/:menuId')
  @RequirePermissions('roles:update')
  async deleteMenuPermission(
    @Param('roleId') roleId: string,
    @Param('menuId') menuId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.menuPermissionService.deleteMenuPermission(tenantId, roleId, menuId);
    return ApiResponse.success(null, 'Menu permission deleted');
  }

  // ═══════════════════════════════════════════════════════
  // CACHE
  // ═══════════════════════════════════════════════════════

  /** POST /cache/clear — Clear all permission caches for tenant. */
  @Post('cache/clear')
  @RequirePermissions('roles:update')
  @HttpCode(200)
  async clearCache(@CurrentUser('tenantId') tenantId: string) {
    this.menuPermissionService.invalidateTenantCache(tenantId);
    return ApiResponse.success(null, 'Cache cleared');
  }
}
