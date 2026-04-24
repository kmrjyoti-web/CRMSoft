import {
  Controller, Get, Post, Param, Body, Query,
  HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SuperAdminGuard } from '../infrastructure/super-admin.guard';
import { SuperAdminRoute } from '../infrastructure/decorators/super-admin-route.decorator';
import { CurrentUser } from '../../../../../common/decorators/current-user.decorator';
import { LicenseService } from '../services/license.service';
import { TenantActivityService } from '../services/tenant-activity.service';
import { GenerateLicenseDto } from './dto/generate-license.dto';
import { ApiResponse } from '../../../../../common/utils/api-response';

@ApiTags('License Management')
@ApiBearerAuth()
@SuperAdminRoute()
@UseGuards(SuperAdminGuard)
@Controller('admin/licenses')
export class LicenseController {
  constructor(
    private readonly licenseService: LicenseService,
    private readonly tenantActivityService: TenantActivityService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all license keys (paginated)' })
  async listAll(@Query() query: any) {
    const result = await this.licenseService.listAll(query);
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate a new license key for a tenant' })
  async generate(
    @Body() body: GenerateLicenseDto,
    @CurrentUser() user: any,
  ) {
    const license = await this.licenseService.generate({
      tenantId: body.tenantId,
      planId: body.planId,
      maxUsers: body.maxUsers,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      allowedModules: body.allowedModules,
      notes: body.notes,
    });

    await this.tenantActivityService.log({
      tenantId: body.tenantId,
      action: 'LICENSE_GENERATED',
      category: 'LICENSE',
      details: `License key generated: ${license.licenseKey}`,
      performedById: user?.id,
    });

    return ApiResponse.success(license, 'License generated');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get license key by ID' })
  async getById(@Param('id') id: string) {
    const license = await this.licenseService.getById(id);
    return ApiResponse.success(license);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a license key' })
  async activate(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const license = await this.licenseService.activate(id);

    await this.tenantActivityService.log({
      tenantId: license.tenantId,
      action: 'LICENSE_ACTIVATED',
      category: 'LICENSE',
      details: `License key activated: ${license.licenseKey}`,
      performedById: user?.id,
    });

    return ApiResponse.success(license, 'License activated');
  }

  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend a license key' })
  async suspend(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const license = await this.licenseService.suspend(id);

    await this.tenantActivityService.log({
      tenantId: license.tenantId,
      action: 'LICENSE_SUSPENDED',
      category: 'LICENSE',
      details: `License key suspended: ${license.licenseKey}`,
      performedById: user?.id,
    });

    return ApiResponse.success(license, 'License suspended');
  }

  @Post(':id/revoke')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke a license key' })
  async revoke(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const license = await this.licenseService.revoke(id);

    await this.tenantActivityService.log({
      tenantId: license.tenantId,
      action: 'LICENSE_REVOKED',
      category: 'LICENSE',
      details: `License key revoked: ${license.licenseKey}`,
      performedById: user?.id,
    });

    return ApiResponse.success(license, 'License revoked');
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate a license key' })
  async validate(@Body('licenseKey') licenseKey: string) {
    const result = await this.licenseService.validate(licenseKey);
    return ApiResponse.success(result);
  }
}
