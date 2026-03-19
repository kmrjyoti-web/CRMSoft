import {
  Controller, Get, Post, Put, Delete,
  Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { VendorGuard } from '../infrastructure/vendor.guard';
import { VendorPackagesService } from '../services/vendor-packages.service';
import { ApiResponse } from '../../../../common/utils/api-response';

@ApiTags('Vendor Packages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorGuard)
@Controller('vendor/packages')
export class VendorPackagesController {
  constructor(private readonly vendorPackagesService: VendorPackagesService) {}

  @Get()
  @ApiOperation({ summary: 'List subscription plans with pagination' })
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = Math.max(Number(page) || 1, 1);
    const l = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const { data, total } = await this.vendorPackagesService.list(p, l);
    return ApiResponse.paginated(data, total, p, l);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plan by ID' })
  async getById(@Param('id') id: string) {
    return ApiResponse.success(await this.vendorPackagesService.getById(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create a subscription plan' })
  async create(@Body() body: Record<string, unknown>) {
    return ApiResponse.success(await this.vendorPackagesService.create(body), 'Plan created');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a subscription plan' })
  async update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return ApiResponse.success(await this.vendorPackagesService.update(id, body), 'Plan updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a subscription plan' })
  async remove(@Param('id') id: string) {
    return ApiResponse.success(await this.vendorPackagesService.deactivate(id), 'Plan deactivated');
  }
}
