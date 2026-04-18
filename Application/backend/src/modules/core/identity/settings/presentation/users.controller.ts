import {
  Controller, Get, Put, Post, Delete, Param, Body, Query, Req,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { SoftDeleteUserCommand } from '../application/commands/soft-delete-user/soft-delete-user.command';
import { RestoreUserCommand } from '../application/commands/restore-user/restore-user.command';
import { PermanentDeleteUserCommand } from '../application/commands/permanent-delete-user/permanent-delete-user.command';
import { ListUsersQuery } from '../application/queries/list-users/list-users.query';
import { GetUserQuery } from '../application/queries/get-user/get-user.query';
import { CurrentUser } from '../../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../../common/utils/api-response';

class UpdateUserDto {
  @ApiPropertyOptional() @IsOptional() @IsString() firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() roleId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() designationId?: string;
  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] })
  @IsOptional() @IsEnum(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
  status?: string;
}

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all users with role, department, designation' })
  async findAll(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('userType') userType?: string,
    @Query('roleId') roleId?: string,
  ) {
    const tenantId = req.user?.tenantId;
    const result = await this.queryBus.execute(new ListUsersQuery(
      tenantId, Number(page) || 1, Math.min(Number(limit) || 50, 10000),
      search, status, userType, roleId,
    ));
    return ApiResponse.success(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID with role, department, designation' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user?.tenantId;
    const user = await this.queryBus.execute(new GetUserQuery(id, tenantId));
    return ApiResponse.success(user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user profile (name, phone, role, department, designation, status)' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const data: any = {};
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.phone !== undefined) data.phone = dto.phone || null;
    if (dto.roleId !== undefined) data.roleId = dto.roleId;
    if (dto.departmentId !== undefined) data.departmentId = dto.departmentId || null;
    if (dto.designationId !== undefined) data.designationId = dto.designationId || null;
    if (dto.status !== undefined) data.status = dto.status;

    const user = await this.prisma.identity.user.update({
      where: { id },
      data,
      include: { role: true, department: true, designation: true },
    });
    return ApiResponse.success(user, 'User updated');
  }

  @Post(':id/soft-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete user (mark as deleted, recoverable)' })
  async softDelete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.commandBus.execute(new SoftDeleteUserCommand(id, userId));
    return ApiResponse.success({ id, isDeleted: true }, 'User soft-deleted');
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a soft-deleted user' })
  async restore(@Param('id') id: string) {
    await this.commandBus.execute(new RestoreUserCommand(id));
    return ApiResponse.success({ id, isDeleted: false }, 'User restored');
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete a soft-deleted user (irreversible)' })
  async permanentDelete(@Param('id') id: string) {
    await this.commandBus.execute(new PermanentDeleteUserCommand(id));
    return ApiResponse.success({ id, deleted: true }, 'User permanently deleted');
  }
}
