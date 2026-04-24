import { Controller, Post, Get, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { AuditSkip } from '../../../core/identity/audit/decorators/audit-skip.decorator';
import { CreateProfileCommand } from '../application/commands/create-profile/create-profile.command';
import { UpdateProfileCommand } from '../application/commands/update-profile/update-profile.command';
import { DeleteProfileCommand } from '../application/commands/delete-profile/delete-profile.command';
import { CloneProfileCommand } from '../application/commands/clone-profile/clone-profile.command';
import { GetProfileListQuery } from '../application/queries/get-profile-list/get-profile-list.query';
import { GetProfileDetailQuery } from '../application/queries/get-profile-detail/get-profile-detail.query';
import { CreateProfileDto, UpdateProfileDto, CloneProfileDto } from './dto/profile.dto';

@Controller('import/profiles')
@UseGuards(JwtAuthGuard)
@AuditSkip()
export class ProfileController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /** Create new import profile */
  @Post()
  @RequirePermissions('import:write')
  async create(@Body() dto: CreateProfileDto, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(new CreateProfileCommand(
      dto.name, dto.targetEntity, dto.fieldMapping, dto.expectedHeaders,
      user.id, `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      dto.description, dto.sourceSystem, dto.icon, dto.color,
      dto.defaultValues, dto.validationRules, dto.duplicateCheckFields,
      dto.duplicateStrategy, dto.fuzzyMatchEnabled, dto.fuzzyMatchFields, dto.fuzzyThreshold,
    ));
    return ApiResponse.success(result, 'Profile created');
  }

  /** List profiles */
  @Get()
  @RequirePermissions('import:read')
  async list(@Query() q: any) {
    const result = await this.queryBus.execute(new GetProfileListQuery(q.targetEntity, q.status, +q.page, +q.limit));
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  /** Profile detail */
  @Get(':id')
  @RequirePermissions('import:read')
  async detail(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetProfileDetailQuery(id));
    return ApiResponse.success(result);
  }

  /** Update profile */
  @Put(':id')
  @RequirePermissions('import:write')
  async update(@Param('id') id: string, @Body() dto: UpdateProfileDto) {
    const result = await this.commandBus.execute(new UpdateProfileCommand(id, dto));
    return ApiResponse.success(result, 'Profile updated');
  }

  /** Archive profile (soft delete) */
  @Delete(':id')
  @RequirePermissions('import:write')
  async archive(@Param('id') id: string) {
    const result = await this.commandBus.execute(new DeleteProfileCommand(id));
    return ApiResponse.success(result, 'Profile archived');
  }

  /** Clone profile */
  @Post(':id/clone')
  @RequirePermissions('import:write')
  async clone(@Param('id') id: string, @Body() dto: CloneProfileDto, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(new CloneProfileCommand(
      id, dto.newName, user.id, `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    ));
    return ApiResponse.success(result, 'Profile cloned');
  }
}
