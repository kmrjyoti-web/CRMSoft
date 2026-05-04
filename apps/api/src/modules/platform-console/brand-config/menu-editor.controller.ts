import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { MenuEditorService } from './menu-editor.service';
import { Public } from '../../../common/decorators/roles.decorator';

@Public()
@Controller('platform-console/menu-editor')
export class MenuEditorController {
  constructor(private readonly service: MenuEditorService) {}

  @Get(':verticalCode')
  async list(@Param('verticalCode') verticalCode: string) {
    return { success: true, data: await this.service.getMenusForVertical(verticalCode) };
  }

  @Post(':verticalCode')
  async create(@Param('verticalCode') verticalCode: string, @Body() body: any) {
    return { success: true, data: await this.service.createMenu(verticalCode, body) };
  }

  @Patch(':verticalCode/menu/:menuId')
  async update(@Param('menuId') menuId: string, @Body() body: Record<string, unknown>) {
    return { success: true, data: await this.service.updateMenu(menuId, body) };
  }

  @Delete(':verticalCode/menu/:menuId')
  async remove(@Param('menuId') menuId: string) {
    return { success: true, data: await this.service.deleteMenu(menuId) };
  }

  @Post(':verticalCode/bulk-order')
  async bulkOrder(
    @Param('verticalCode') verticalCode: string,
    @Body() body: { updates: Array<{ id: string; parent_menu_id?: string | null; sort_order?: number; depth_level?: number }> },
  ) {
    return { success: true, data: await this.service.bulkUpdateOrder(verticalCode, body.updates ?? []) };
  }

  @Post(':verticalCode/validate-route')
  async validateRoute(
    @Param('verticalCode') verticalCode: string,
    @Body() body: { route: string; excludeMenuId?: string },
  ) {
    return { success: true, data: await this.service.validateRoute(verticalCode, body.route, body.excludeMenuId) };
  }
}
