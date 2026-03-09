import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@ApiTags('Packages')
@ApiBearerAuth()
@Controller('packages')
export class PackagesController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Create package' })
  @RequirePermissions('packages:create')
  async create(@Body() dto: CreatePackageDto) {
    const pkg = await this.prisma.package.create({
      data: { ...dto, code: dto.code.toUpperCase() },
    });
    return ApiResponse.success(pkg, 'Package created');
  }

  @Get()
  @ApiOperation({ summary: 'List packages' })
  @RequirePermissions('packages:read')
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    const p = Math.max(1, +page);
    const l = Math.min(100, Math.max(1, +limit));
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.package.findMany({ where, skip: (p - 1) * l, take: l, orderBy: { name: 'asc' } }),
      this.prisma.package.count({ where }),
    ]);
    return ApiResponse.paginated(data, total, p, l);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get package by ID' })
  @RequirePermissions('packages:read')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const pkg = await this.prisma.package.findUniqueOrThrow({ where: { id } });
    return ApiResponse.success(pkg);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update package' })
  @RequirePermissions('packages:update')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePackageDto) {
    const data: any = { ...dto };
    if (dto.code) data.code = dto.code.toUpperCase();
    const pkg = await this.prisma.package.update({ where: { id }, data });
    return ApiResponse.success(pkg, 'Package updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate package' })
  @RequirePermissions('packages:delete')
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    const pkg = await this.prisma.package.update({ where: { id }, data: { isActive: false } });
    return ApiResponse.success(pkg, 'Package deactivated');
  }
}
