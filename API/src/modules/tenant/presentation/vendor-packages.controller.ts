import {
  Controller, Get, Post, Put, Delete,
  Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { VendorGuard } from '../infrastructure/vendor.guard';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../common/utils/api-response';

@ApiTags('Vendor Packages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorGuard)
@Controller('vendor/packages')
export class VendorPackagesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List subscription plans with pagination' })
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = Math.max(Number(page) || 1, 1);
    const l = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const [data, total] = await Promise.all([
      this.prisma.plan.findMany({
        skip: (p - 1) * l,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.plan.count(),
    ]);

    return ApiResponse.paginated(data, total, p, l);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plan by ID' })
  async getById(@Param('id') id: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    return ApiResponse.success(plan);
  }

  @Post()
  @ApiOperation({ summary: 'Create a subscription plan' })
  async create(@Body() body: any) {
    const plan = await this.prisma.plan.create({ data: body });
    return ApiResponse.success(plan, 'Plan created');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a subscription plan' })
  async update(@Param('id') id: string, @Body() body: any) {
    const plan = await this.prisma.plan.update({
      where: { id },
      data: body,
    });
    return ApiResponse.success(plan, 'Plan updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a subscription plan' })
  async remove(@Param('id') id: string) {
    const plan = await this.prisma.plan.update({
      where: { id },
      data: { isActive: false },
    });
    return ApiResponse.success(plan, 'Plan deactivated');
  }
}
