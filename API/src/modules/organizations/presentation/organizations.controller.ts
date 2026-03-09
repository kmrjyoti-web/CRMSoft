import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  HttpCode, HttpStatus, UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreateOrganizationCommand } from '../application/commands/create-organization/create-organization.command';
import { UpdateOrganizationCommand } from '../application/commands/update-organization/update-organization.command';
import { DeactivateOrganizationCommand } from '../application/commands/deactivate-organization/deactivate-organization.command';
import { ReactivateOrganizationCommand } from '../application/commands/reactivate-organization/reactivate-organization.command';
import { SoftDeleteOrganizationCommand } from '../application/commands/soft-delete-organization/soft-delete-organization.command';
import { RestoreOrganizationCommand } from '../application/commands/restore-organization/restore-organization.command';
import { PermanentDeleteOrganizationCommand } from '../application/commands/permanent-delete-organization/permanent-delete-organization.command';
import { GetOrganizationByIdQuery } from '../application/queries/get-organization-by-id/get-organization-by-id.query';
import { GetOrganizationsListQuery } from '../application/queries/get-organizations-list/get-organizations-list.query';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationQueryDto } from './dto/organization-query.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { DataMaskingInterceptor, MaskTable } from '../../table-config/data-masking.interceptor';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}


  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  async create(@Body() dto: CreateOrganizationDto, @CurrentUser('id') userId: string) {
    const id = await this.commandBus.execute(
      new CreateOrganizationCommand(
        dto.name, userId, dto.website, dto.email, dto.phone,
        dto.gstNumber, dto.address, dto.city, dto.state,
        dto.country, dto.pincode, dto.industry, dto.annualRevenue,
        dto.notes, dto.filterIds,
      ),
    );
    const org = await this.queryBus.execute(new GetOrganizationByIdQuery(id));
    return ApiResponse.success(org, 'Organization created');
  }

  @Get()
  @UseInterceptors(DataMaskingInterceptor)
  @MaskTable('organizations')
  @ApiOperation({ summary: 'List organizations (paginated, filtered)' })
  async findAll(@Query() query: OrganizationQueryDto) {
    const result = await this.queryBus.execute(
      new GetOrganizationsListQuery(
        query.page ?? 1, query.limit ?? 20, query.sortBy ?? 'createdAt', query.sortOrder ?? 'desc',
        query.search, query.city, query.industry, query.isActive,
      ),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID (with contacts, leads, filters)' })
  async findById(@Param('id') id: string) {
    const org = await this.queryBus.execute(new GetOrganizationByIdQuery(id));
    return ApiResponse.success(org);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update organization (active only)' })
  async update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    await this.commandBus.execute(new UpdateOrganizationCommand(id, dto, dto.filterIds));
    const org = await this.queryBus.execute(new GetOrganizationByIdQuery(id));
    return ApiResponse.success(org, 'Organization updated');
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate organization (soft delete)' })
  async deactivate(@Param('id') id: string) {
    await this.commandBus.execute(new DeactivateOrganizationCommand(id));
    const org = await this.queryBus.execute(new GetOrganizationByIdQuery(id));
    return ApiResponse.success(org, 'Organization deactivated');
  }

  @Post(':id/reactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reactivate deactivated organization' })
  async reactivate(@Param('id') id: string) {
    await this.commandBus.execute(new ReactivateOrganizationCommand(id));
    const org = await this.queryBus.execute(new GetOrganizationByIdQuery(id));
    return ApiResponse.success(org, 'Organization reactivated');
  }

  @Post(':id/soft-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete organization (mark as deleted, recoverable)' })
  async softDelete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.commandBus.execute(new SoftDeleteOrganizationCommand(id, userId));
    const org = await this.queryBus.execute(new GetOrganizationByIdQuery(id));
    return ApiResponse.success(org, 'Organization soft-deleted');
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a soft-deleted organization' })
  async restore(@Param('id') id: string) {
    await this.commandBus.execute(new RestoreOrganizationCommand(id));
    const org = await this.queryBus.execute(new GetOrganizationByIdQuery(id));
    return ApiResponse.success(org, 'Organization restored');
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete a soft-deleted organization (irreversible)' })
  async permanentDelete(@Param('id') id: string) {
    await this.commandBus.execute(new PermanentDeleteOrganizationCommand(id));
    return ApiResponse.success({ id, deleted: true }, 'Organization permanently deleted');
  }
}
