import {
  Controller, Get, Post, Put, Patch, Param, Body, Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { VendorGuard } from '../infrastructure/vendor.guard';
import { ApiResponse } from '../../../common/utils/api-response';

@ApiTags('Vendor Dev Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorGuard)
@Controller('vendor/dev-requests')
export class VendorDevRequestsController {
  @Get()
  @ApiOperation({ summary: 'List dev requests (stub)' })
  async list(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return ApiResponse.paginated([], 0, +page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dev request by ID (stub)' })
  async getById(@Param('id') id: string) {
    return ApiResponse.success({
      id,
      title: 'Dev Request',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a dev request (stub)' })
  async create(@Body() body: any) {
    return ApiResponse.success(
      { id: crypto.randomUUID(), ...body, status: 'PENDING', createdAt: new Date().toISOString() },
      'Dev request created',
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a dev request (stub)' })
  async update(@Param('id') id: string, @Body() body: any) {
    return ApiResponse.success(
      { id, ...body, updatedAt: new Date().toISOString() },
      'Dev request updated',
    );
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update dev request status (stub)' })
  async updateStatus(@Param('id') id: string, @Body() body: any) {
    return ApiResponse.success(
      { id, status: body.status, updatedAt: new Date().toISOString() },
      'Status updated',
    );
  }
}
