import {
  Controller, Get, Post, Put, Delete, Param, Body, Query, Req,
  HttpCode, HttpStatus, NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../common/utils/api-response';

// ── DTOs ─────────────────────────────────────────────────

class CreateRoleDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() displayName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsUUID('4', { each: true }) permissionIds?: string[];
}

class UpdateRoleDto {
  @ApiPropertyOptional() @IsOptional() @IsString() displayName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsUUID('4', { each: true }) permissionIds?: string[];
}

class UpdateRolePermissionsDto {
  @ApiProperty() @IsArray() @IsUUID('4', { each: true }) permissionIds: string[];
}

// ── Controller ───────────────────────────────────────────

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List all roles with user counts' })
  async findAll(@Req() req: any, @Query('search') search?: string) {
    const tenantId = req.user?.tenantId;
    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
      ];
    }
    const roles = await this.prisma.role.findMany({
      where,
      orderBy: { level: 'asc' },
      include: { _count: { select: { users: true } } },
    });
    return ApiResponse.success(roles);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID with permissions' })
  async findOne(@Param('id') id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
    });
    if (!role) throw new NotFoundException('Role not found');
    // Flatten permissions for frontend compatibility
    const result = {
      ...role,
      permissions: role.permissions.map((rp) => rp.permission),
    };
    return ApiResponse.success(result);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  async create(@Body() dto: CreateRoleDto) {
    const role = await this.prisma.role.create({
      data: {
        name: dto.name,
        displayName: dto.displayName,
        description: dto.description,
        permissions: dto.permissionIds?.length
          ? { create: dto.permissionIds.map((pid) => ({ permissionId: pid })) }
          : undefined,
      },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
    });
    const result = { ...role, permissions: role.permissions.map((rp) => rp.permission) };
    return ApiResponse.success(result, 'Role created');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update role (display name, description, permissions)' })
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    // Update basic fields
    await this.prisma.role.update({
      where: { id },
      data: {
        ...(dto.displayName !== undefined && { displayName: dto.displayName }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });

    // Sync permissions if provided
    if (dto.permissionIds !== undefined) {
      await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
      if (dto.permissionIds.length > 0) {
        await this.prisma.rolePermission.createMany({
          data: dto.permissionIds.map((pid) => ({ roleId: id, permissionId: pid })),
        });
      }
    }

    const role = await this.prisma.role.findUniqueOrThrow({
      where: { id },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
    });
    const result = { ...role, permissions: role.permissions.map((rp) => rp.permission) };
    return ApiResponse.success(result, 'Role updated');
  }

  @Put(':id/permissions')
  @ApiOperation({ summary: 'Update role permissions (replace all)' })
  async updatePermissions(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateRolePermissionsDto) {
    const tenantId = req.user?.tenantId;
    const deleteWhere: any = { roleId: id };
    if (tenantId) deleteWhere.tenantId = tenantId;
    await this.prisma.rolePermission.deleteMany({ where: deleteWhere });
    if (dto.permissionIds.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: dto.permissionIds.map((pid) => ({
          roleId: id,
          permissionId: pid,
          ...(tenantId ? { tenantId } : {}),
        })),
      });
    }
    return ApiResponse.success({ roleId: id, permissionCount: dto.permissionIds.length }, 'Permissions updated');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a custom role' })
  async remove(@Param('id') id: string) {
    const role = await this.prisma.role.findUniqueOrThrow({ where: { id } });
    if (role.isSystem) {
      throw new NotFoundException('Cannot delete system roles');
    }
    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
    await this.prisma.role.delete({ where: { id } });
    return ApiResponse.success({ id }, 'Role deleted');
  }
}
