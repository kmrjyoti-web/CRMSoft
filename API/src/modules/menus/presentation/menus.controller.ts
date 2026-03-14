import {
  Controller, Post, Get, Put, Param, Body,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
// import { Public } from '../../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ReorderMenusDto } from './dto/reorder-menus.dto';
import { CreateMenuCommand } from '../application/commands/create-menu/create-menu.command';
import { UpdateMenuCommand } from '../application/commands/update-menu/update-menu.command';
import { ReorderMenusCommand } from '../application/commands/reorder-menus/reorder-menus.command';
import { DeactivateMenuCommand } from '../application/commands/deactivate-menu/deactivate-menu.command';
import { BulkSeedMenusCommand } from '../application/commands/bulk-seed-menus/bulk-seed-menus.command';
import { GetMenuTreeQuery } from '../application/queries/get-menu-tree/get-menu-tree.query';
import { GetMyMenuQuery } from '../application/queries/get-my-menu/get-my-menu.query';
import { GetMenuByIdQuery } from '../application/queries/get-menu-by-id/get-menu-by-id.query';
import { MENU_SEED_DATA } from './menu-seed-data';

@Controller('menus')
export class MenusController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
  ) {}

  /** POST / — Create menu item (admin). */
  @Post()
  @RequirePermissions('menus:create')
  async create(@Body() dto: CreateMenuDto) {
    const result = await this.commandBus.execute(
      new CreateMenuCommand(
        dto.name, dto.code, dto.icon, dto.route, dto.parentId,
        dto.sortOrder, dto.menuType, dto.permissionModule,
        dto.permissionAction, dto.badgeColor, dto.badgeText, dto.openInNewTab,
      ),
    );
    return ApiResponse.success(result, 'Menu created');
  }

  /** GET /tree — Full menu tree (admin). */
  @Get('tree')
  @RequirePermissions('menus:read')
  async getTree(@CurrentUser() user: any) {
    const result = await this.queryBus.execute(
      new GetMenuTreeQuery(true, user.tenantId, user.isSuperAdmin),
    );
    return ApiResponse.success(result);
  }

  /** GET /my-menu — Permission-filtered menu for current user (5-check chain). */
  @Get('my-menu')
  async getMyMenu(@CurrentUser() user: any) {
    const result = await this.queryBus.execute(
      new GetMyMenuQuery(
        user.id, user.roleId, user.role,
        user.isSuperAdmin, user.tenantId,
        user.businessTypeCode,
      ),
    );
    return ApiResponse.success(result);
  }

  /** GET /:id — Get single menu. */
  @Get(':id')
  @RequirePermissions('menus:read')
  async getById(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetMenuByIdQuery(id));
    return ApiResponse.success(result);
  }

  /** PUT /:id — Update menu. */
  @Put(':id')
  @RequirePermissions('menus:update')
  async update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    const result = await this.commandBus.execute(new UpdateMenuCommand(id, dto));
    return ApiResponse.success(result, 'Menu updated');
  }

  /** POST /:id/deactivate — Deactivate menu (cascade children). */
  @Post(':id/deactivate')
  @RequirePermissions('menus:delete')
  async deactivate(@Param('id') id: string) {
    const result = await this.commandBus.execute(new DeactivateMenuCommand(id));
    return ApiResponse.success(result, 'Menu deactivated');
  }

  /** POST /reorder — Reorder menu items. */
  @Post('reorder')
  @RequirePermissions('menus:update')
  async reorder(@Body() dto: ReorderMenusDto) {
    const result = await this.commandBus.execute(
      new ReorderMenusCommand(dto.parentId ?? null, dto.orderedIds),
    );
    return ApiResponse.success(result, 'Menus reordered');
  }

  /** POST /seed — Bulk seed menus (admin). */
  @Post('seed')
  @RequirePermissions('menus:create')
  async seed(@CurrentUser() user: any) {
    const result = await this.commandBus.execute(
      new BulkSeedMenusCommand(MENU_SEED_DATA, user.tenantId, user.isSuperAdmin),
    );
    return ApiResponse.success(result, 'Menus seeded');
  }

  /** GET /discovery — List unmapped routes (admin only). */
  @Get('discovery')
  @RequirePermissions('menus:read')
  async getDiscovery(@CurrentUser() user: any) {
    const tenantId = user.tenantId || await this.getDefaultTenantId();
    const menus = await this.prisma.menu.findMany({
      where: { tenantId, isActive: true },
      select: { route: true, code: true, isAdminOnly: true },
    });
    const menuRoutes = new Set(
      menus.filter(m => m.route && !m.isAdminOnly).map(m => m.route!.split('?')[0]),
    );

    // Get all unmapped items from DB
    const unmappedGroup = await this.prisma.menu.findFirst({
      where: { tenantId, code: '_UNMAPPED', isActive: true },
    });
    const unmappedItems = unmappedGroup
      ? await this.prisma.menu.findMany({
          where: { tenantId, isAdminOnly: true, route: { not: null }, isActive: true },
          select: { route: true, name: true, code: true },
        })
      : [];

    // Build categories from unmapped items
    const categories: Record<string, any[]> = {};
    for (const item of unmappedItems) {
      const cat = this.getRouteCategory(item.route!);
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push({ route: item.route, name: item.name, category: cat });
    }

    return ApiResponse.success({
      totalRoutes: menuRoutes.size + unmappedItems.length,
      mappedRoutes: menuRoutes.size,
      unmappedRoutes: unmappedItems.map(i => ({
        route: i.route,
        name: i.name,
        category: this.getRouteCategory(i.route!),
      })),
      categories,
    });
  }

  /** POST /discovery/refresh — Re-run discovery and update unmapped group. */
  @Post('discovery/refresh')
  @RequirePermissions('menus:create')
  async refreshDiscovery(@CurrentUser() user: any) {
    // This endpoint triggers the discovery script logic server-side
    // For now, it returns the current count
    const tenantId = user.tenantId || await this.getDefaultTenantId();
    const unmappedGroup = await this.prisma.menu.findFirst({
      where: { tenantId, code: '_UNMAPPED', isActive: true },
    });
    const unmappedCount = unmappedGroup
      ? await this.prisma.menu.count({ where: { tenantId, isAdminOnly: true, route: { not: null }, isActive: true } })
      : 0;
    return ApiResponse.success(
      { unmapped: unmappedCount, message: 'Run node scripts/create-unmapped-menu.js to refresh.' },
      'Discovery info',
    );
  }

  private getRouteCategory(route: string): string {
    const map: [string, string][] = [
      ['/accounts', 'Accounts'], ['/admin', 'Admin'], ['/campaigns', 'Communication'],
      ['/communication', 'Communication'], ['/demos', 'CRM'], ['/email', 'Communication'],
      ['/finance', 'Finance'], ['/import', 'Tools'], ['/inventory', 'Inventory'],
      ['/master', 'Master'], ['/notifications', 'Settings'], ['/onboarding', 'Settings'],
      ['/ownership', 'Settings'], ['/performance', 'CRM'], ['/plugins', 'Tools'],
      ['/post-sales', 'Support'], ['/pricing', 'Master'], ['/procurement', 'Purchase'],
      ['/products', 'Master'], ['/recycle-bin', 'Tools'], ['/reports', 'Reports'],
      ['/sales', 'Sale'], ['/settings', 'Settings'], ['/support', 'Support'],
      ['/whatsapp', 'Communication'], ['/workflows', 'Tools'],
    ];
    for (const [prefix, cat] of map) {
      if (route.startsWith(prefix)) return cat;
    }
    return 'Other';
  }

  private async getDefaultTenantId(): Promise<string> {
    const t = await this.prisma.tenant.findFirst({ where: { slug: 'default' } });
    return t?.id ?? '';
  }
}
