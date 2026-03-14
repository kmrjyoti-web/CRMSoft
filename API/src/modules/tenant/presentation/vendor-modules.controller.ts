import {
  Controller, Get, Post, Put, Delete,
  Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { VendorGuard } from '../infrastructure/vendor.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../common/utils/api-response';

@ApiTags('Vendor Modules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorGuard)
@Controller('vendor/modules')
export class VendorModulesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List marketplace modules' })
  async list(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = Math.max(Number(page) || 1, 1);
    const l = Math.min(Math.max(Number(limit) || 20, 1), 100);

    // Map frontend-friendly status values to Prisma enum
    const STATUS_MAP: Record<string, string> = {
      ACTIVE: 'PUBLISHED',
      INACTIVE: 'SUSPENDED',
    };

    const where: any = {};
    if (status) where.status = STATUS_MAP[status] ?? status;
    if (user.vendorId) where.vendorId = user.vendorId;

    const [rawData, total] = await Promise.all([
      this.prisma.marketplaceModule.findMany({
        where,
        skip: (p - 1) * l,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.marketplaceModule.count({ where }),
    ]);

    // Map DB fields to frontend-friendly names
    const data = rawData.map((m) => ({
      id: m.id,
      code: m.moduleCode,
      name: m.moduleName,
      description: m.shortDescription,
      category: m.category,
      version: m.version,
      status: m.status === 'PUBLISHED' ? 'ACTIVE' : m.status === 'SUSPENDED' ? 'INACTIVE' : m.status,
      features: [],
      pricing: { monthly: 0, yearly: 0 },
      subscriberCount: m.installCount,
      dependsOn: [],
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));

    return ApiResponse.paginated(data, total, p, l);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get module by ID' })
  async getById(@Param('id') id: string) {
    const m = await this.prisma.marketplaceModule.findUnique({ where: { id } });
    if (!m) return ApiResponse.success(null);
    return ApiResponse.success({
      id: m.id,
      code: m.moduleCode,
      name: m.moduleName,
      description: m.shortDescription,
      category: m.category,
      version: m.version,
      status: m.status === 'PUBLISHED' ? 'ACTIVE' : m.status === 'SUSPENDED' ? 'INACTIVE' : m.status,
      features: [],
      pricing: { monthly: 0, yearly: 0 },
      subscriberCount: m.installCount,
      dependsOn: [],
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a marketplace module' })
  async create(
    @CurrentUser() user: any,
    @Body() body: {
      code?: string; moduleCode?: string;
      name?: string; moduleName?: string;
      description?: string; shortDescription?: string;
      longDescription?: string;
      category: string;
      version?: string;
      features?: string[];
    },
  ) {
    const module = await this.prisma.marketplaceModule.create({
      data: {
        moduleCode: body.code ?? body.moduleCode ?? '',
        moduleName: body.name ?? body.moduleName ?? '',
        category: body.category,
        shortDescription: body.description ?? body.shortDescription ?? '',
        longDescription: body.longDescription ?? '',
        version: body.version ?? '1.0.0',
        vendorId: user.vendorId,
      },
    });
    return ApiResponse.success(module, 'Module created');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a marketplace module' })
  async update(
    @Param('id') id: string,
    @Body() body: {
      moduleName?: string;
      shortDescription?: string;
      longDescription?: string;
      version?: string;
      category?: string;
      status?: string;
    },
  ) {
    const data: any = {};
    if (body.moduleName !== undefined) data.moduleName = body.moduleName;
    if (body.shortDescription !== undefined) data.shortDescription = body.shortDescription;
    if (body.longDescription !== undefined) data.longDescription = body.longDescription;
    if (body.version !== undefined) data.version = body.version;
    if (body.category !== undefined) data.category = body.category;
    if (body.status !== undefined) data.status = body.status;

    const module = await this.prisma.marketplaceModule.update({
      where: { id },
      data,
    });
    return ApiResponse.success(module, 'Module updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a marketplace module' })
  async remove(@Param('id') id: string) {
    const module = await this.prisma.marketplaceModule.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });
    return ApiResponse.success(module, 'Module deactivated');
  }
}
