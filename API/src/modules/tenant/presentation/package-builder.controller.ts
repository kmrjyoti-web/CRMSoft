import {
  Controller, Get, Post, Patch, Delete,
  Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { VendorGuard } from '../infrastructure/vendor.guard';
import { PackageBuilderService } from '../services/package-builder.service';
import { ApiResponse } from '../../../common/utils/api-response';

@ApiTags('Package Builder')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorGuard)
@Controller('vendor/package-builder')
export class PackageBuilderController {
  constructor(
    private readonly svc: PackageBuilderService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List packages with optional filters' })
  async list(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = Math.max(Number(page) || 1, 1);
    const l = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const active = isActive !== undefined ? isActive === 'true' : undefined;

    const result = await this.svc.list({ search, isActive: active, page: p, limit: l });
    return ApiResponse.paginated(result.data, result.total, p, l);
  }

  @Get('compare')
  @ApiOperation({ summary: 'Compare multiple packages side by side' })
  async compare(@Query('ids') ids: string) {
    const packageIds = ids.split(',').map((id) => id.trim()).filter(Boolean);
    const data = await this.svc.getPackageComparison(packageIds);
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get package by ID with full module details' })
  async getById(@Param('id') id: string) {
    const data = await this.svc.getById(id);
    return ApiResponse.success(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new package' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(@Body() body: any) {
    const data = await this.svc.create(body);
    return ApiResponse.success(data, 'Package created');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing package' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.svc.update(id, body);
    return ApiResponse.success(data, 'Package updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete (archive) a package' })
  async archive(@Param('id') id: string) {
    const data = await this.svc.archive(id);
    return ApiResponse.success(data, 'Package archived');
  }

  @Post(':id/modules')
  @ApiOperation({ summary: 'Add a module to a package' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async addModule(@Param('id') id: string, @Body() body: any) {
    const data = await this.svc.addModule(id, body);
    return ApiResponse.success(data, 'Module added to package');
  }

  @Patch(':id/modules/:moduleId')
  @ApiOperation({ summary: 'Update module configuration within a package' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateModule(@Param('id') id: string, @Param('moduleId') moduleId: string, @Body() body: any) {
    const data = await this.svc.updateModule(id, moduleId, body);
    return ApiResponse.success(data, 'Module configuration updated');
  }

  @Delete(':id/modules/:moduleId')
  @ApiOperation({ summary: 'Remove a module from a package' })
  async removeModule(@Param('id') id: string, @Param('moduleId') moduleId: string) {
    const data = await this.svc.removeModule(id, moduleId);
    return ApiResponse.success(data, 'Module removed from package');
  }

  @Patch(':id/limits')
  @ApiOperation({ summary: 'Update entity limits for a package' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateLimits(@Param('id') id: string, @Body() body: any) {
    const data = await this.svc.updateLimits(id, body);
    return ApiResponse.success(data, 'Package limits updated');
  }

  @Get(':id/subscribers')
  @ApiOperation({ summary: 'List tenants subscribed to a package' })
  async getSubscribers(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = Math.max(Number(page) || 1, 1);
    const l = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const result = await this.svc.getSubscribers(id, { page: p, limit: l });
    return ApiResponse.paginated(result.data, result.total, p, l);
  }
}
