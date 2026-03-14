import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { VendorGuard } from '../infrastructure/vendor.guard';
import { ApiResponse } from '../../../common/utils/api-response';
import { PageRegistryService, AssignPageDto, BulkAssignDto, UpdatePageDto } from '../services/page-registry.service';
import { PageScannerService } from '../services/page-scanner.service';
import { PageMenuSyncService } from '../services/page-menu-sync.service';

@ApiTags('Page Registry')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorGuard)
@Controller('vendor/pages')
export class PageRegistryController {
  constructor(
    private readonly pageRegistry: PageRegistryService,
    private readonly pageScanner: PageScannerService,
    private readonly pageMenuSync: PageMenuSyncService,
  ) {}

  // ─── 1. List all pages ──────────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'List all registered pages with filtering' })
  async list(
    @Query('portal') portal?: string,
    @Query('category') category?: string,
    @Query('pageType') pageType?: string,
    @Query('moduleCode') moduleCode?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = Math.max(Number(page) || 1, 1);
    const l = Math.min(Math.max(Number(limit) || 50, 1), 200);

    const { data, total } = await this.pageRegistry.list({
      portal,
      category,
      pageType,
      moduleCode,
      search,
      page: p,
      limit: l,
    });

    return ApiResponse.paginated(data, total, p, l);
  }

  // ─── 2. Page stats ──────────────────────────────────────────────────
  @Get('stats')
  @ApiOperation({ summary: 'Get page registry statistics' })
  async stats() {
    const stats = await this.pageRegistry.getStats();
    return ApiResponse.success(stats);
  }

  // ─── 3. Unassigned pages ────────────────────────────────────────────
  @Get('unassigned')
  @ApiOperation({ summary: 'List pages not assigned to any module' })
  async unassigned(
    @Query('portal') portal?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = Math.max(Number(page) || 1, 1);
    const l = Math.min(Math.max(Number(limit) || 50, 1), 200);

    const { data, total } = await this.pageRegistry.getUnassigned({
      portal,
      search,
      page: p,
      limit: l,
    });

    return ApiResponse.paginated(data, total, p, l);
  }

  // ─── 4. Trigger scan ───────────────────────────────────────────────
  @Post('scan')
  @ApiOperation({ summary: 'Trigger a re-scan of all routes from filesystem' })
  async scan() {
    const result = await this.pageScanner.scanAndRegister();
    return ApiResponse.success(result, `Scanned ${result.total} pages (${result.created} new, ${result.updated} updated)`);
  }

  // ─── 5. Get page by ID ─────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Get page detail by ID' })
  async getById(@Param('id') id: string) {
    const page = await this.pageRegistry.getById(id);
    return ApiResponse.success(page);
  }

  // ─── 6. Update page ────────────────────────────────────────────────
  @Patch(':id')
  @ApiOperation({ summary: 'Update page metadata (friendly name, type, category, etc.)' })
  async update(@Param('id') id: string, @Body() body: UpdatePageDto) {
    const page = await this.pageRegistry.update(id, body);
    return ApiResponse.success(page, 'Page updated');
  }

  // ─── 7. Assign page to module ──────────────────────────────────────
  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign a page to a module' })
  async assign(@Param('id') id: string, @Body() body: AssignPageDto) {
    const page = await this.pageRegistry.assignToModule(id, body);
    return ApiResponse.success(page, 'Page assigned to module');
  }

  // ─── 8. Bulk assign pages ──────────────────────────────────────────
  @Post('bulk-assign')
  @ApiOperation({ summary: 'Bulk assign multiple pages to a module' })
  async bulkAssign(@Body() body: BulkAssignDto) {
    const result = await this.pageRegistry.bulkAssign(body);
    return ApiResponse.success(result, `${result.updated} pages assigned`);
  }

  // ─── 9. Unassign page ──────────────────────────────────────────────
  @Delete(':id/unassign')
  @ApiOperation({ summary: 'Remove page from its module' })
  async unassign(@Param('id') id: string) {
    const page = await this.pageRegistry.unassignFromModule(id);
    return ApiResponse.success(page, 'Page unassigned from module');
  }

  // ─── 10. Get module pages ──────────────────────────────────────────
  @Get('modules/:code/pages')
  @ApiOperation({ summary: 'Get all pages assigned to a module' })
  async getModulePages(@Param('code') code: string) {
    const pages = await this.pageRegistry.getModulePages(code);
    return ApiResponse.success(pages);
  }

  // ─── 11. Reorder module pages ──────────────────────────────────────
  @Patch('modules/:code/pages/reorder')
  @ApiOperation({ summary: 'Reorder pages within a module' })
  async reorderModulePages(
    @Param('code') code: string,
    @Body() body: { orderedIds: string[] },
  ) {
    const pages = await this.pageRegistry.reorderModulePages(code, body.orderedIds);
    return ApiResponse.success(pages, 'Pages reordered');
  }

  // ─── 12. Sync module pages to Menu table ───────────────────────────
  @Post('modules/:code/pages/sync-menus')
  @ApiOperation({ summary: 'Sync module pages into the Menu table for all tenants' })
  async syncMenus(@Param('code') code: string) {
    const result = await this.pageMenuSync.syncModulePages(code);
    return ApiResponse.success(result, `Synced ${result.synced} menu entries across ${result.tenants} tenants`);
  }
}
