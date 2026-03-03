import {
  Controller, Post, Get, Put, Param, Body,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
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
  async getTree() {
    const result = await this.queryBus.execute(new GetMenuTreeQuery());
    return ApiResponse.success(result);
  }

  /** GET /my-menu — Permission-filtered menu for current user. */
  @Get('my-menu')
  async getMyMenu(@CurrentUser() user: any) {
    const result = await this.queryBus.execute(
      new GetMyMenuQuery(user.id, user.roleId, user.role),
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
  async seed() {
    const result = await this.commandBus.execute(
      new BulkSeedMenusCommand(MENU_SEED_DATA),
    );
    return ApiResponse.success(result, 'Menus seeded');
  }
}
