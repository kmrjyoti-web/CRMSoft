import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../../common/utils/api-response';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@ApiTags('Business Locations')
@ApiBearerAuth()
@Controller('business-locations')
export class LocationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Create location' })
  @RequirePermissions('locations:create')
  async create(@Body() dto: CreateLocationDto) {
    const loc = await this.prisma.businessLocation.create({
      data: {
        name: dto.name,
        code: dto.code.toUpperCase(),
        level: dto.level as any,
        parentId: dto.parentId,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });
    return ApiResponse.success(loc, 'Location created');
  }

  @Get()
  @ApiOperation({ summary: 'List locations' })
  @RequirePermissions('locations:read')
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('level') level?: string,
    @Query('parentId') parentId?: string,
    @Query('search') search?: string,
  ) {
    const p = Math.max(1, +page);
    const l = Math.min(200, Math.max(1, +limit));
    const where: any = {};
    if (level) where.level = level;
    if (parentId) where.parentId = parentId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.businessLocation.findMany({
        where, skip: (p - 1) * l, take: l,
        orderBy: { name: 'asc' },
      }),
      this.prisma.businessLocation.count({ where }),
    ]);
    return ApiResponse.paginated(data, total, p, l);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get location hierarchy (Country ? State ? City ? Area)' })
  @RequirePermissions('locations:read')
  async getTree(@Query('rootCode') rootCode?: string) {
    const where: any = { isActive: true };
    if (rootCode) {
      const root = await this.prisma.businessLocation.findFirst({
        where: { code: rootCode.toUpperCase() },
      });
      if (root) where.OR = [{ id: root.id }, { parentId: root.id }];
    }
    const all = await this.prisma.businessLocation.findMany({
      where: rootCode ? undefined : where,
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
    });
    const map = new Map(all.map(l => [l.id, { ...l, children: [] as any[] }]));
    const roots: any[] = [];
    for (const loc of map.values()) {
      if (loc.parentId && map.has(loc.parentId)) {
        map.get(loc.parentId)!.children.push(loc);
      } else {
        roots.push(loc);
      }
    }
    return ApiResponse.success(roots, 'Location tree');
  }

  @Get('countries')
  @ApiOperation({ summary: 'List all countries' })
  @RequirePermissions('locations:read')
  async getCountries() {
    const countries = await this.prisma.businessLocation.findMany({
      where: { level: 'COUNTRY', isActive: true },
      orderBy: { name: 'asc' },
    });
    return ApiResponse.success(countries);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get location by ID' })
  @RequirePermissions('locations:read')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const loc = await this.prisma.businessLocation.findUniqueOrThrow({
      where: { id },
      include: { parent: true, children: { where: { isActive: true } } },
    });
    return ApiResponse.success(loc);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get child locations' })
  @RequirePermissions('locations:read')
  async getChildren(@Param('id', ParseUUIDPipe) id: string) {
    const children = await this.prisma.businessLocation.findMany({
      where: { parentId: id, isActive: true },
      orderBy: { name: 'asc' },
    });
    return ApiResponse.success(children);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update location' })
  @RequirePermissions('locations:update')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    const data: any = { ...dto };
    if (dto.code) data.code = dto.code.toUpperCase();
    const loc = await this.prisma.businessLocation.update({ where: { id }, data });
    return ApiResponse.success(loc, 'Location updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate location' })
  @RequirePermissions('locations:delete')
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    const loc = await this.prisma.businessLocation.update({
      where: { id }, data: { isActive: false },
    });
    return ApiResponse.success(loc, 'Location deactivated');
  }

  @Post(':id/organizations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Link organization to location' })
  @RequirePermissions('locations:update')
  async linkOrganization(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('organizationId') organizationId: string,
    @Body('isPrimary') isPrimary?: boolean,
  ) {
    const existing = await this.prisma.organizationLocation.findFirst({
      where: { organizationId, locationId: id },
    });
    let link;
    if (existing) {
      link = await this.prisma.organizationLocation.update({
        where: { id: existing.id },
        data: { isPrimary },
      });
    } else {
      link = await this.prisma.organizationLocation.create({
        data: { organizationId, locationId: id, isPrimary: isPrimary ?? false },
      });
    }
    return ApiResponse.success(link, 'Organization linked to location');
  }

  @Delete(':id/organizations/:orgId')
  @ApiOperation({ summary: 'Unlink organization from location' })
  @RequirePermissions('locations:update')
  async unlinkOrganization(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('orgId', ParseUUIDPipe) orgId: string,
  ) {
    await this.prisma.organizationLocation.deleteMany({
      where: { organizationId: orgId, locationId: id },
    });
    return ApiResponse.success(null, 'Organization unlinked');
  }
}
