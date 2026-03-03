import {
  Controller, Get, Post, Put, Param, Body, Query,
  HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SuperAdminGuard } from '../infrastructure/super-admin.guard';
import { SuperAdminRoute } from '../infrastructure/decorators/super-admin-route.decorator';
import { CreateTenantCommand } from '../application/commands/create-tenant/create-tenant.command';
import { UpdateTenantCommand } from '../application/commands/update-tenant/update-tenant.command';
import { SuspendTenantCommand } from '../application/commands/suspend-tenant/suspend-tenant.command';
import { ActivateTenantCommand } from '../application/commands/activate-tenant/activate-tenant.command';
import { CreateSuperAdminCommand } from '../application/commands/create-super-admin/create-super-admin.command';
import { ListTenantsQuery } from '../application/queries/list-tenants/query';
import { GetTenantByIdQuery } from '../application/queries/get-tenant-by-id/query';
import { GetTenantUsageQuery } from '../application/queries/get-tenant-usage/query';
import { GetTenantDashboardQuery } from '../application/queries/get-tenant-dashboard/query';
import { ListSuperAdminsQuery } from '../application/queries/list-super-admins/query';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantQueryDto } from './dto/tenant-query.dto';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { ApiResponse } from '../../../common/utils/api-response';

@ApiTags('Tenant Admin')
@ApiBearerAuth()
@SuperAdminRoute()
@UseGuards(SuperAdminGuard)
@Controller('admin/tenants')
export class TenantAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant with admin user' })
  async create(@Body() dto: CreateTenantDto) {
    const tenantId = await this.commandBus.execute(
      new CreateTenantCommand(
        dto.name,
        dto.slug,
        dto.adminEmail,
        dto.adminPassword,
        dto.adminFirstName,
        dto.adminLastName,
        dto.planId,
      ),
    );
    const tenant = await this.queryBus.execute(new GetTenantByIdQuery(tenantId));
    return ApiResponse.success(tenant, 'Tenant created');
  }

  @Get()
  @ApiOperation({ summary: 'List all tenants (paginated, filterable)' })
  async findAll(@Query() query: TenantQueryDto) {
    const result = await this.queryBus.execute(
      new ListTenantsQuery(
        query.page ?? 1,
        query.limit ?? 20,
        query.status,
        query.search,
      ),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('super-admins')
  @ApiOperation({ summary: 'List all super admins' })
  async listSuperAdmins() {
    const result = await this.queryBus.execute(new ListSuperAdminsQuery());
    return ApiResponse.success(result);
  }

  @Post('super-admins')
  @ApiOperation({ summary: 'Create a new super admin' })
  async createSuperAdmin(@Body() dto: CreateSuperAdminDto) {
    const result = await this.commandBus.execute(
      new CreateSuperAdminCommand(
        dto.email,
        dto.password,
        dto.firstName,
        dto.lastName,
      ),
    );
    return ApiResponse.success(result, 'Super admin created');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  async findById(@Param('id') id: string) {
    const tenant = await this.queryBus.execute(new GetTenantByIdQuery(id));
    return ApiResponse.success(tenant);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tenant details' })
  async update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    await this.commandBus.execute(
      new UpdateTenantCommand(id, dto.name, dto.domain, dto.logo, dto.settings),
    );
    const tenant = await this.queryBus.execute(new GetTenantByIdQuery(id));
    return ApiResponse.success(tenant, 'Tenant updated');
  }

  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend a tenant' })
  async suspend(@Param('id') id: string) {
    await this.commandBus.execute(new SuspendTenantCommand(id));
    const tenant = await this.queryBus.execute(new GetTenantByIdQuery(id));
    return ApiResponse.success(tenant, 'Tenant suspended');
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a tenant' })
  async activate(@Param('id') id: string) {
    await this.commandBus.execute(new ActivateTenantCommand(id));
    const tenant = await this.queryBus.execute(new GetTenantByIdQuery(id));
    return ApiResponse.success(tenant, 'Tenant activated');
  }

  @Get(':id/usage')
  @ApiOperation({ summary: 'Get tenant usage statistics' })
  async getUsage(@Param('id') id: string) {
    const usage = await this.queryBus.execute(new GetTenantUsageQuery(id));
    return ApiResponse.success(usage);
  }

  @Get(':id/dashboard')
  @ApiOperation({ summary: 'Get tenant dashboard data' })
  async getDashboard(@Param('id') id: string) {
    const dashboard = await this.queryBus.execute(new GetTenantDashboardQuery(id));
    return ApiResponse.success(dashboard);
  }
}
