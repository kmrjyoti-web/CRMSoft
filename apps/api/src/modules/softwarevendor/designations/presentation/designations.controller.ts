import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../../common/utils/api-response';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';

@ApiTags('Designations')
@ApiBearerAuth()
@Controller('designations')
export class DesignationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Create designation' })
  @RequirePermissions('designations:create')
  async create(@Body() dto: CreateDesignationDto) {
    const desig = await this.prisma.designation.create({
      data: {
        name: dto.name,
        code: dto.code.toUpperCase(),
        description: dto.description,
        level: dto.level ?? 0,
        grade: dto.grade,
        departmentId: dto.departmentId,
        parentId: dto.parentId,
      },
    });
    return ApiResponse.success(desig, 'Designation created');
  }

  @Get()
  @ApiOperation({ summary: 'List designations' })
  @RequirePermissions('designations:read')
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('departmentId') departmentId?: string,
    @Query('search') search?: string,
  ) {
    const p = Math.max(1, +page);
    const l = Math.min(100, Math.max(1, +limit));
    const where: any = {};
    if (departmentId) where.departmentId = departmentId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.designation.findMany({
        where, skip: (p - 1) * l, take: l,
        orderBy: { level: 'asc' },
        include: { department: { select: { id: true, name: true } } },
      }),
      this.prisma.designation.count({ where }),
    ]);
    return ApiResponse.paginated(data, total, p, l);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get designation hierarchy' })
  @RequirePermissions('designations:read')
  async getTree(@Query('departmentId') departmentId?: string) {
    const where: any = { isActive: true };
    if (departmentId) where.departmentId = departmentId;
    const all = await this.prisma.designation.findMany({
      where, orderBy: { level: 'asc' },
    });
    const map = new Map(all.map(d => [d.id, { ...d, children: [] as any[] }]));
    const roots: any[] = [];
    for (const d of map.values()) {
      if (d.parentId && map.has(d.parentId)) {
        map.get(d.parentId)!.children.push(d);
      } else {
        roots.push(d);
      }
    }
    return ApiResponse.success(roots, 'Designation tree');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get designation by ID' })
  @RequirePermissions('designations:read')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const desig = await this.prisma.designation.findUniqueOrThrow({
      where: { id },
      include: { department: true, parent: true, children: true },
    });
    return ApiResponse.success(desig);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update designation' })
  @RequirePermissions('designations:update')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDesignationDto,
  ) {
    const data: any = { ...dto };
    if (dto.code) data.code = dto.code.toUpperCase();
    const desig = await this.prisma.designation.update({ where: { id }, data });
    return ApiResponse.success(desig, 'Designation updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate designation' })
  @RequirePermissions('designations:delete')
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    const desig = await this.prisma.designation.update({
      where: { id }, data: { isActive: false },
    });
    return ApiResponse.success(desig, 'Designation deactivated');
  }

  @Get(':id/users')
  @ApiOperation({ summary: 'Get users with this designation' })
  @RequirePermissions('designations:read')
  async getUsers(@Param('id', ParseUUIDPipe) id: string) {
    const users = await this.prisma.user.findMany({
      where: { designationId: id },
      select: {
        id: true, firstName: true, lastName: true,
        email: true, status: true,
      },
    });
    return ApiResponse.success(users);
  }
}
