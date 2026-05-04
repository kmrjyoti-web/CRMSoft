import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { MenuManagementService } from './menu-management.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { SetBrandOverrideDto } from './dto/set-brand-override.dto';
import { Public } from '../../../common/decorators/roles.decorator';

@Public()
@Controller('platform-console/menus')
export class MenuManagementController {
  constructor(private readonly menuManagementService: MenuManagementService) {}

  // Static routes first
  @Get('flat')
  getMenuFlat() {
    return this.menuManagementService.getMenuFlat();
  }

  @Get()
  getMenuTree() {
    return this.menuManagementService.getMenuTree();
  }

  @Post()
  createMenuItem(@Body() dto: CreateMenuItemDto) {
    return this.menuManagementService.createMenuItem(dto);
  }

  @Post('reorder')
  reorderMenuItems(@Body() body: Array<{ id: string; sortOrder: number; parentKey?: string }>) {
    return this.menuManagementService.reorderMenuItems(body);
  }

  @Get('brands/:brandId')
  getMenuWithBrandOverrides(@Param('brandId') brandId: string) {
    return this.menuManagementService.getMenuWithBrandOverrides(brandId);
  }

  @Post('brands/:brandId/override')
  setBrandOverride(@Param('brandId') brandId: string, @Body() dto: SetBrandOverrideDto) {
    return this.menuManagementService.setBrandOverride(brandId, dto);
  }

  @Patch('brands/:brandId/override/:id')
  updateBrandOverride(
    @Param('id') id: string,
    @Body() body: { customLabel?: string; customIcon?: string; isHidden?: boolean; sortOrder?: number },
  ) {
    return this.menuManagementService.updateBrandOverride(id, body);
  }

  @Delete('brands/:brandId/override/:id')
  removeBrandOverride(@Param('id') id: string) {
    return this.menuManagementService.removeBrandOverride(id);
  }

  @Get('brands/:brandId/overrides')
  getBrandOverrides(@Param('brandId') brandId: string) {
    return this.menuManagementService.getBrandOverrides(brandId);
  }

  @Get('preview/:brandId')
  previewMenu(@Param('brandId') brandId: string) {
    return this.menuManagementService.previewMenu(brandId);
  }

  @Get('preview/:brandId/:role')
  previewMenuWithRole(@Param('brandId') brandId: string, @Param('role') role: string) {
    return this.menuManagementService.previewMenu(brandId, role);
  }

  @Patch(':id')
  updateMenuItem(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.menuManagementService.updateMenuItem(id, dto);
  }

  @Delete(':id')
  deleteMenuItem(@Param('id') id: string) {
    return this.menuManagementService.deleteMenuItem(id);
  }
}
