import {
  Controller, Get, Post, Put, Body, Param, Query,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from '../../../common/utils/api-response';
import { SubscriptionPackageService } from '../services/subscription-package.service';
import {
  CreateSubscriptionPackageDto,
  UpdateSubscriptionPackageDto,
  ListPackagesQueryDto,
} from './dto/subscription-package.dto';

@ApiTags('Subscription Packages')
@ApiBearerAuth()
@Controller('subscription-packages')
export class SubscriptionPackageController {
  constructor(private readonly packageService: SubscriptionPackageService) {}

  @Get()
  @ApiOperation({ summary: 'List all subscription packages' })
  async listAll(@Query() query: ListPackagesQueryDto) {
    const packages = await this.packageService.listAll(query.activeOnly);
    return ApiResponse.success(packages);
  }

  @Get('featured')
  @ApiOperation({ summary: 'List featured active packages' })
  async getFeatured() {
    const packages = await this.packageService.getFeatured();
    return ApiResponse.success(packages);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get package detail by code' })
  async getByCode(@Param('code') code: string) {
    const pkg = await this.packageService.getByCode(code);
    return ApiResponse.success(pkg);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a subscription package (admin)' })
  async create(@Body() dto: CreateSubscriptionPackageDto) {
    const pkg = await this.packageService.create(dto);
    return ApiResponse.success(pkg, 'Package created');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a subscription package (admin)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionPackageDto,
  ) {
    const pkg = await this.packageService.update(id, dto);
    return ApiResponse.success(pkg, 'Package updated');
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a subscription package (admin)' })
  async deactivate(@Param('id') id: string) {
    const pkg = await this.packageService.deactivate(id);
    return ApiResponse.success(pkg, 'Package deactivated');
  }
}
