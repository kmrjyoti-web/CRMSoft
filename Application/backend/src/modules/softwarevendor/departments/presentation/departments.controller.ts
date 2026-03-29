import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../../common/utils/api-response';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@ApiTags('Departments')
@ApiBearerAuth()
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Create department' })
  @RequirePermissions('departments:create')
  async create(@Body() dto: CreateDepartmentDto) {
    const dept = await this.prisma.department.create({
      data: {
        name: dto.name,
        displayName: dto.displayName,
        code: dto.code.toUpperCase(),
        description: dto.description,
        level: dto.level ?? 0,
        parentId: dto.parentId,
        headUserId: dto.headUserId,
        path: await this.buildPath(dto.parentId, dto.code.toUpperCase()),
      },
    });
    return ApiResponse.success(dept, 'Department created');
  }

  @Get()
  @ApiOperation({ summary: 'List departments' })
  @RequirePermissions('departments:read')
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
        { displayName: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.department.findMany({
        where, skip: (p - 1) * l, take: l,
        orderBy: { name: 'asc' },
        include: { headUser: { select: { id: true, firstName: true, lastName: true } } },
      }),
      this.prisma.department.count({ where }),
    ]);
    return ApiResponse.paginated(data, total, p, l);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get department hierarchy tree' })
  @RequirePermissions('departments:read')
  async getTree() {
    const all = await this.prisma.department.findMany({
      where: { isActive: true },
      orderBy: { level: 'asc' },
      include: { headUser: { select: { id: true, firstName: true, lastName: true } } },
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
    return ApiResponse.success(roots, 'Department tree');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @RequirePermissions('departments:read')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const dept = await this.prisma.department.findUniqueOrThrow({
      where: { id },
      include: {
        parent: true,
        children: true,
        headUser: { select: { id: true, firstName: true, lastName: true } },
        designations: { where: { isActive: true } },
      },
    });
    return ApiResponse.success(dept);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update department' })
  @RequirePermissions('departments:update')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    const data: any = { ...dto };
    if (dto.code) data.code = dto.code.toUpperCase();
    if (dto.parentId !== undefined || dto.code) {
      const current = await this.prisma.department.findUniqueOrThrow({ where: { id } });
      const code = dto.code?.toUpperCase() ?? current.code;
      data.path = await this.buildPath(dto.parentId ?? current.parentId, code);
    }
    const dept = await this.prisma.department.update({ where: { id }, data });
    return ApiResponse.success(dept, 'Department updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate department' })
  @RequirePermissions('departments:delete')
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    const dept = await this.prisma.department.update({
      where: { id }, data: { isActive: false },
    });
    return ApiResponse.success(dept, 'Department deactivated');
  }

  @Post(':id/set-head')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set department head' })
  @RequirePermissions('departments:update')
  async setHead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('userId') userId: string,
  ) {
    const dept = await this.prisma.department.update({
      where: { id }, data: { headUserId: userId },
    });
    return ApiResponse.success(dept, 'Department head set');
  }

  @Get(':id/users')
  @ApiOperation({ summary: 'Get users in department' })
  @RequirePermissions('departments:read')
  async getUsers(@Param('id', ParseUUIDPipe) id: string) {
    const users = await this.prisma.user.findMany({
      where: { departmentId: id },
      select: {
        id: true, firstName: true, lastName: true,
        email: true, status: true, designation: true,
      },
    });
    return ApiResponse.success(users);
  }

  private async buildPath(parentId: string | null | undefined, code: string): Promise<string> {
    if (!parentId) return `/${code}`;
    const parent = await this.prisma.department.findUnique({ where: { id: parentId } });
    return parent?.path ? `${parent.path}/${code}` : `/${code}`;
  }
}
