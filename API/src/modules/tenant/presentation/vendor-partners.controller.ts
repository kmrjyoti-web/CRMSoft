import {
  Controller, Get, Post, Patch, Param, Body, Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { VendorGuard } from '../infrastructure/vendor.guard';
import { ApiResponse } from '../../../common/utils/api-response';

@ApiTags('Vendor Partners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorGuard)
@Controller('vendor/partners')
export class VendorPartnersController {

  @Get()
  @ApiOperation({ summary: 'List all partners (stub)' })
  async list(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return ApiResponse.paginated([], 0, +page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get partner by ID (stub)' })
  async getById(@Param('id') id: string) {
    return ApiResponse.success({ id, name: 'Partner', status: 'ACTIVE' });
  }

  @Post()
  @ApiOperation({ summary: 'Create a partner (stub)' })
  async create(@Body() body: any) {
    return ApiResponse.success(body, 'Partner created');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a partner (stub)' })
  async update(@Param('id') id: string, @Body() body: any) {
    return ApiResponse.success({ id, ...body }, 'Partner updated');
  }
}
