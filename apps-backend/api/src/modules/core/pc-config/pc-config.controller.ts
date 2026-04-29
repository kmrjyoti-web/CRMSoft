import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  ConflictException, HttpCode, HttpStatus, UseGuards, Request,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, MinLength, IsArray, IsBoolean, IsInt, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PcConfigService } from './pc-config.service';
import { WlDomainService } from './wl-domain.service';
import { WlDbProvisioningService } from '../identity/tenant/services/wl-db-provisioning.service';
import { TenantDataMigrationService } from '../identity/tenant/services/tenant-data-migration.service';
import { ErrorCenterService } from '../../platform-console/error-center/error-center.service';
import { PartnerCommissionService, CreateCommissionRuleDto, UpdateCommissionRuleDto } from './partner-commission.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles, Public } from '../../../common/decorators/roles.decorator';

// ── DTOs ─────────────────────────────────────────────────────────────────────

class CreatePartnerDto {
  @ApiProperty({ example: 'TRAVVELLIS' }) @IsString() code: string;
  @ApiProperty({ example: 'TRV' }) @IsString() shortCode: string;
  @ApiProperty({ example: 'Travvellis' }) @IsString() @MinLength(2) name: string;
  @ApiProperty({ example: 'owner@travvellis.com' }) @IsEmail() ownerEmail: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ example: 'ENTERPRISE' }) @IsOptional() @IsString() licenseLevel?: string;
}

class CreateBrandDto {
  @ApiProperty({ example: 'TRAVELSIS' }) @IsString() code: string;
  @ApiPropertyOptional({ example: 'TLS' }) @IsOptional() @IsString() shortCode?: string;
  @ApiProperty({ example: 'Travelsis' }) @IsString() @MinLength(2) name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() partnerId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() layoutFolder?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPublic?: boolean;
}

class CreateCrmEditionDto {
  @ApiProperty({ example: 'TRAVEL' }) @IsString() code: string;
  @ApiPropertyOptional({ example: 'TRV' }) @IsOptional() @IsString() shortCode?: string;
  @ApiProperty({ example: 'Travel CRM' }) @IsString() @MinLength(2) name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

class CreateVerticalDto {
  @ApiProperty({ example: 'TRAVEL_TOURISM' }) @IsString() typeCode: string;
  @ApiProperty({ example: 'Travel & Tourism' }) @IsString() @MinLength(2) typeName: string;
  @ApiProperty({ example: 'SERVICES' }) @IsString() industryCategory: string;
  @ApiPropertyOptional() @IsOptional() @IsString() crmEditionId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() shortCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Type(() => Number) sortOrder?: number;
}

class CreateSubTypeDto {
  @ApiProperty({ example: 'DMC_PROVIDER' }) @IsString() code: string;
  @ApiProperty({ example: 'DMCP' }) @IsString() shortCode: string;
  @ApiProperty({ example: 'DMC Provider' }) @IsString() @MinLength(2) name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsUUID() verticalId: string;
  @ApiProperty({ example: 'B2B' }) @IsString() userType: string;
  @ApiProperty({ example: ['B2B', 'B2C'] }) @IsArray() @IsString({ each: true }) allowedBusinessModes: string[];
  @ApiPropertyOptional({ example: 'B2B' }) @IsOptional() @IsString() defaultBusinessMode?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() businessModeRequired?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Type(() => Number) sortOrder?: number;
}

class UpdateSubTypeDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() shortCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() userType?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) allowedBusinessModes?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() defaultBusinessMode?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() businessModeRequired?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Type(() => Number) sortOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

class CreateOnboardingStageDto {
  @ApiProperty({ example: 'newsletter_consent' }) @IsString() stageKey: string;
  @ApiProperty({ example: 'Subscribe to Newsletter' }) @IsString() stageLabel: string;
  @ApiProperty({ example: 'StageNewsletterConsent' }) @IsString() componentName: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() required?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Type(() => Number) sortOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() combinedCodeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() skipIfFieldSet?: string;
}

class UpdateOnboardingStageDto {
  @ApiPropertyOptional() @IsOptional() @IsString() stageLabel?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() componentName?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() required?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() skipIfFieldSet?: string;
}

class ReorderOnboardingStagesDto {
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) stageIds: string[];
}

class CreateRegistrationFieldDto {
  @ApiProperty({ example: 'B2B_TRAV_TRAVL_DMC' }) @IsString() combinedCode: string;
  @ApiProperty({ example: 'phone' }) @IsString() fieldKey: string;
  @ApiProperty({ example: 'text' }) @IsString() fieldType: string;
  @ApiProperty({ example: 'Phone Number' }) @IsString() label: string;
  @ApiPropertyOptional() @IsOptional() @IsString() placeholder?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() helpText?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() required?: boolean;
  @ApiPropertyOptional() @IsOptional() options?: any;
  @ApiPropertyOptional() @IsOptional() validation?: any;
  @ApiPropertyOptional() @IsOptional() showWhen?: any;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Type(() => Number) sortOrder?: number;
}

class UpdateRegistrationFieldDto {
  @ApiPropertyOptional() @IsOptional() @IsString() label?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() placeholder?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() helpText?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() required?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() fieldType?: string;
  @ApiPropertyOptional() @IsOptional() options?: any;
  @ApiPropertyOptional() @IsOptional() validation?: any;
  @ApiPropertyOptional() @IsOptional() showWhen?: any;
}

class ReorderRegistrationFieldsDto {
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) fieldIds: string[];
}

class AddStageFieldDto {
  @ApiProperty() @IsUUID() stageId: string;
  @ApiProperty() @IsUUID() combinedCodeId: string;
  @ApiProperty({ example: 'mobile' }) @IsString() fieldKey: string;
  @ApiProperty({ example: 'phone' }) @IsString() fieldType: string;
  @ApiProperty({ example: 'Mobile Number' }) @IsString() label: string;
  @ApiPropertyOptional() @IsOptional() @IsString() placeholder?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() helpText?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() required?: boolean;
}

class CreateSubscriptionPlanDto {
  @ApiProperty({ example: 'STARTER' }) @IsString() packageCode: string;
  @ApiProperty({ example: 'Starter Plan' }) @IsString() packageName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tagline?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Type(() => Number) tier?: number;
  @ApiProperty({ example: 999 }) @Type(() => Number) priceMonthlyInr: number;
  @ApiProperty({ example: 9990 }) @Type(() => Number) priceYearlyInr: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Type(() => Number) trialDays?: number;
  @ApiPropertyOptional() @IsOptional() entityLimits?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() featureFlags?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasDedicatedDb?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPublic?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Type(() => Number) sortOrder?: number;
}

class UpdateSubscriptionPlanDto {
  @ApiPropertyOptional() @IsOptional() @IsString() packageName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tagline?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) priceMonthlyInr?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) priceYearlyInr?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Type(() => Number) trialDays?: number;
  @ApiPropertyOptional() @IsOptional() entityLimits?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() featureFlags?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasDedicatedDb?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPublic?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Type(() => Number) sortOrder?: number;
}

class ConfirmDbConnectionDto {
  @ApiProperty({ example: 'postgresql://user:pass@host:5432/crmsoft_xtreme_prod' })
  @IsString() connectionString: string;
}

class CreateMasterCodeDto {
  @ApiProperty({ example: 'TRAVVELLIS' }) @IsString() partnerCode: string;
  @ApiProperty({ example: 'TRAVEL' }) @IsString() editionCode: string;
  @ApiProperty({ example: 'TRAVELSIS' }) @IsString() brandCode: string;
  @ApiProperty({ example: 'TRAVEL_TOURISM' }) @IsString() verticalCode: string;
  @ApiProperty({ example: 'Travelsis Travel & Tourism' }) @IsString() @MinLength(2) displayName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() commonRegFields?: any[];
  @ApiPropertyOptional() @IsOptional() commonOnboardingStages?: any[];
}

class UpdateMasterCodeDto {
  @ApiPropertyOptional() @IsOptional() @IsString() displayName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() commonRegFields?: any[];
  @ApiPropertyOptional() @IsOptional() commonOnboardingStages?: any[];
}

class CreateMasterCodeConfigDto {
  @ApiProperty({ example: 'B2B' }) @IsString() userTypeCode: string;
  @ApiPropertyOptional({ example: 'DMCP' }) @IsOptional() @IsString() subTypeCode?: string;
  @ApiProperty({ example: 'B2B DMC Provider' }) @IsString() @MinLength(2) displayName: string;
  @ApiPropertyOptional() @IsOptional() extraRegFields?: any[];
  @ApiPropertyOptional() @IsOptional() overrideOnboardingStages?: any[];
}

class UpdateMasterCodeConfigDto {
  @ApiPropertyOptional() @IsOptional() @IsString() displayName?: string;
  @ApiPropertyOptional() @IsOptional() extraRegFields?: any[];
  @ApiPropertyOptional() @IsOptional() overrideOnboardingStages?: any[];
}

class CreateCombinedCodeDto {
  @ApiProperty({ example: 'B2B_TRAV_TRAVL_DMC' }) @IsString() code: string;
  @ApiProperty() @IsUUID() partnerId: string;
  @ApiProperty() @IsString() brandId: string;
  @ApiProperty() @IsUUID() crmEditionId: string;
  @ApiProperty() @IsString() verticalId: string;
  @ApiProperty({ example: 'B2B' }) @IsString() userType: string;
  @ApiProperty() @IsUUID() subTypeId: string;
  @ApiProperty({ example: 'Travvellis DMC Provider' }) @IsString() @MinLength(2) displayName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ example: ['B2B', 'B2C'] }) @IsOptional() @IsArray() @IsString({ each: true }) businessModes?: string[];
}

// ── Controller ────────────────────────────────────────────────────────────────

@Controller('pc-config')
export class PcConfigController {
  constructor(
    private readonly svc: PcConfigService,
    private readonly wlDomain: WlDomainService,
    private readonly wlDbProv: WlDbProvisioningService,
    private readonly errorCenter: ErrorCenterService,
    private readonly migrationSvc: TenantDataMigrationService,
    private readonly commissionSvc: PartnerCommissionService,
  ) {}

  // ── READ endpoints (public — unauthenticated users need these for registration) ──

  @Public() @Get('partners')
  listPartners() { return this.svc.listPartners(); }

  @Public() @Get('partner/:code')
  getPartner(@Param('code') code: string) { return this.svc.getPartner(code); }

  @Public() @Get('crm-editions')
  listCrmEditions() { return this.svc.listCrmEditions(); }

  @Public() @Get('brands')
  listBrands() { return this.svc.listBrands(); }

  @Public() @Get('brand/:code')
  getBrand(@Param('code') code: string) { return this.svc.getBrand(code); }

  @Public() @Get('verticals')
  listVerticals(@Query('crmEdition') crmEdition?: string) {
    return this.svc.listVerticals(crmEdition);
  }

  @Public() @Get('sub-types')
  listSubTypes(
    @Query('vertical') vertical: string,
    @Query('userType') userType?: string,
  ) {
    if (!vertical) return this.svc.listAllSubTypes();
    return this.svc.listSubTypes(vertical, userType);
  }

  @Public() @Get('suggest-code')
  @ApiOperation({ summary: 'v2.3 — Auto-suggest code from name + uniqueness check' })
  suggestCode(
    @Query('name') name: string,
    @Query('type') type: 'partner' | 'brand' | 'edition' | 'vertical' | 'subtype',
  ) {
    return this.svc.suggestCode(name, type);
  }

  @Public() @Get('check-code')
  @ApiOperation({ summary: 'M3.5 — Real-time code uniqueness check' })
  async checkCode(
    @Query('code') code: string,
    @Query('type') type: 'partner' | 'brand' | 'edition' | 'vertical' | 'subtype' | 'combined',
  ) {
    const normalised = code?.trim().toUpperCase();
    if (!normalised) return { available: false, reason: 'empty' };

    const checkers: Record<string, () => Promise<boolean>> = {
      partner:  async () => !(await this.svc.getPartner(normalised)),
      brand:    async () => !(await this.svc.getBrand(normalised)),
      edition:  async () => !(await this.svc.getCrmEdition(normalised)),
      vertical: async () => {
        const all = await this.svc.listVerticals();
        return !(all as any[]).some((v) => v.typeCode === normalised);
      },
      subtype:  async () => {
        const all = await this.svc.listAllSubTypes();
        return !(all as any[]).some((s) => s.code === normalised);
      },
      combined: async () => !(await this.svc.getCombinedCode(normalised)),
    };

    const check = checkers[type];
    if (!check) return { available: false, reason: 'unknown type' };
    const available = await check();
    return { code: normalised, type, available };
  }

  @Public() @Get('combined-code/:code')
  @ApiOperation({ summary: 'Backward compat — reads from new master code table by resolvedCode, falls back to old combined code' })
  async getCombinedCode(@Param('code') code: string) {
    const fromNew = await this.svc.getByResolvedCode(code);
    if (fromNew) return fromNew;
    return this.svc.getCombinedCode(code);
  }

  @Public() @Get('registration-form')
  getRegistrationForm(@Query('combinedCode') combinedCode: string) {
    return this.svc.getRegistrationFields(combinedCode);
  }

  @Public() @Get('onboarding-stages')
  getOnboardingStages(@Query('combinedCode') combinedCode?: string) {
    return this.svc.getOnboardingStages(combinedCode);
  }

  @Public() @Get('page-registry')
  listPageRegistry(@Query('portal') portal?: string) {
    return this.svc.listPageRegistry(portal);
  }

  // DEPRECATED: use GET /pc-config/master-codes instead
  @Public() @Get('combined-codes')
  listCombinedCodes(@Query('brandCode') brandCode?: string) {
    return this.svc.listCombinedCodes(brandCode);
  }

  // ── M7: Per-user access (requires portal_token) ────────────────────────────

  @Get('my-access')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'M7 — Get current user page access rules from pc_page_access' })
  async getMyAccess(@Request() req: any) {
    const combinedCode: string | null = req.user?.combinedCode ?? null;
    return this.svc.getMyAccess(combinedCode);
  }

  // ── Master Codes (new Sprint 5.1 endpoints) ───────────────────────────────

  @Get('master-codes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Sprint 5.1 — List all master codes with child config count' })
  listMasterCodes(
    @Query('partnerCode') partnerCode?: string,
    @Query('brandCode') brandCode?: string,
    @Query('verticalCode') verticalCode?: string,
  ) {
    return this.svc.listMasterCodes({ partnerCode, brandCode, verticalCode });
  }

  @Get('master-codes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Sprint 5.1 — Get master code detail + all child configs' })
  getMasterCode(@Param('id') id: string) {
    return this.svc.getMasterCode(id);
  }

  @Post('master-codes')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Sprint 5.1 — Create master code (auto-generates masterCode from parts)' })
  async createMasterCode(@Body() dto: CreateMasterCodeDto, @Request() req: any) {
    try {
      return await this.svc.createMasterCode({ ...dto, createdById: req.user?.id });
    } catch (err: any) {
      if (err.message?.includes('already exists')) throw new ConflictException(err.message);
      throw err;
    }
  }

  @Patch('master-codes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Sprint 5.1 — Update master code' })
  updateMasterCode(@Param('id') id: string, @Body() dto: UpdateMasterCodeDto) {
    return this.svc.updateMasterCode(id, dto);
  }

  @Delete('master-codes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Sprint 5.1 — Soft-delete (deactivate) master code' })
  async deleteMasterCode(@Param('id') id: string) {
    await this.svc.deleteMasterCode(id);
    return { success: true };
  }

  @Get('master-codes/:id/configs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Sprint 5.1 — List configs under a master code' })
  listConfigs(@Param('id') id: string) {
    return this.svc.listConfigs(id);
  }

  @Post('master-codes/:id/configs')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Sprint 5.1 — Add user type config under a master code' })
  async createConfig(@Param('id') id: string, @Body() dto: CreateMasterCodeConfigDto) {
    try {
      return await this.svc.createConfig(id, dto);
    } catch (err: any) {
      if (err.message?.includes('already exists')) throw new ConflictException(err.message);
      throw err;
    }
  }

  @Patch('master-codes/:id/configs/:configId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Sprint 5.1 — Update a config under a master code' })
  updateConfig(
    @Param('id') id: string,
    @Param('configId') configId: string,
    @Body() dto: UpdateMasterCodeConfigDto,
  ) {
    return this.svc.updateConfig(id, configId, dto);
  }

  @Delete('master-codes/:id/configs/:configId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Sprint 5.1 — Soft-delete a config' })
  async deleteConfig(@Param('id') id: string, @Param('configId') configId: string) {
    await this.svc.deleteConfig(id, configId);
    return { success: true };
  }

  @Public() @Get('resolved-fields/:resolvedCode')
  @ApiOperation({ summary: 'Sprint 5.1 — Get merged common + extra reg fields by resolvedCode' })
  getResolvedFields(@Param('resolvedCode') resolvedCode: string) {
    return this.svc.getResolvedFields(resolvedCode);
  }

  // ── WRITE endpoints (admin-only) ──────────────────────────────────────────

  @Post('partners')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'M3.5 — Create a new partner' })
  async createPartner(@Body() dto: CreatePartnerDto) {
    try {
      return await this.svc.createPartner(dto);
    } catch (err: any) {
      if (err.message?.includes('already exists')) throw new ConflictException(err.message);
      throw err;
    }
  }

  @Post('brands')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'M3.5 — Create a new brand' })
  async createBrand(@Body() dto: CreateBrandDto) {
    try {
      return await this.svc.createBrand(dto);
    } catch (err: any) {
      if (err.message?.includes('already exists')) throw new ConflictException(err.message);
      throw err;
    }
  }

  @Post('crm-editions')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'M3.5 — Create a new CRM edition' })
  async createCrmEdition(@Body() dto: CreateCrmEditionDto) {
    try {
      return await this.svc.createCrmEdition(dto);
    } catch (err: any) {
      if (err.message?.includes('already exists')) throw new ConflictException(err.message);
      throw err;
    }
  }

  @Post('verticals')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'M3.5 — Create a new vertical' })
  async createVertical(@Body() dto: CreateVerticalDto) {
    try {
      return await this.svc.createVertical(dto);
    } catch (err: any) {
      if (err.message?.includes('already exists')) throw new ConflictException(err.message);
      throw err;
    }
  }

  @Get('sub-types-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Admin: list all sub-types including inactive' })
  listSubTypesAdmin() {
    return this.svc.listAllSubTypesAdmin();
  }

  @Post('sub-types')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'v2.3 — Create a new sub-type' })
  async createSubType(@Body() dto: CreateSubTypeDto) {
    try {
      return await this.svc.createSubType(dto);
    } catch (err: any) {
      if (err.message?.includes('already exists')) throw new ConflictException(err.message);
      throw err;
    }
  }

  @Patch('sub-types/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Update a sub-type' })
  updateSubType(@Param('id') id: string, @Body() dto: UpdateSubTypeDto) {
    return this.svc.updateSubType(id, dto);
  }

  @Delete('sub-types/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Soft-delete (deactivate) a sub-type' })
  async deleteSubType(@Param('id') id: string) {
    await this.svc.deleteSubType(id);
    return { success: true };
  }

  // DEPRECATED: use POST /pc-config/master-codes + POST /pc-config/master-codes/:id/configs instead
  @Post('combined-code')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'M3 — Create a new combined code (builder save action) [DEPRECATED]' })
  async createCombinedCode(@Body() dto: CreateCombinedCodeDto) {
    try {
      return await this.svc.createCombinedCode(dto);
    } catch (err: any) {
      if (err.message?.includes('already exists')) throw new ConflictException(err.message);
      throw err;
    }
  }

  // ── Onboarding Stage Management ──────────────────────────────────────────────

  @Get('onboarding-stages-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Admin: list all onboarding stages (including inactive)' })
  listStagesAdmin(@Query('combinedCode') combinedCode?: string) {
    return this.svc.listOnboardingStagesAdmin(combinedCode);
  }

  @Post('onboarding-stages')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Admin: create onboarding stage' })
  createStage(@Body() dto: CreateOnboardingStageDto) {
    return this.svc.createOnboardingStage(dto);
  }

  @Patch('onboarding-stages/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Admin: reorder stages by array of IDs' })
  async reorderStages(@Body() dto: ReorderOnboardingStagesDto) {
    await this.svc.reorderOnboardingStages(dto.stageIds);
    return { success: true };
  }

  @Patch('onboarding-stages/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Admin: update onboarding stage' })
  updateStage(@Param('id') id: string, @Body() dto: UpdateOnboardingStageDto) {
    return this.svc.updateOnboardingStage(id, dto);
  }

  @Patch('onboarding-stages/:id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Admin: toggle stage active/inactive' })
  toggleStage(@Param('id') id: string) {
    return this.svc.toggleOnboardingStage(id);
  }

  @Delete('onboarding-stages/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Admin: soft-delete (deactivate) a stage' })
  async deleteStage(@Param('id') id: string) {
    await this.svc.deleteOnboardingStage(id);
    return { success: true };
  }

  // ── Registration Field Management ────────────────────────────────────────────

  @Get('registration-fields-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Admin: list all registration fields for a combined code (including inactive)' })
  listFieldsAdmin(@Query('combinedCode') combinedCode: string) {
    return this.svc.listRegistrationFieldsAdmin(combinedCode);
  }

  @Post('registration-fields')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Admin: create registration field' })
  createField(@Body() dto: CreateRegistrationFieldDto) {
    return this.svc.createRegistrationField(dto);
  }

  @Patch('registration-fields/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Admin: reorder fields by array of IDs' })
  async reorderFields(@Body() dto: ReorderRegistrationFieldsDto) {
    await this.svc.reorderRegistrationFields(dto.fieldIds);
    return { success: true };
  }

  @Patch('registration-fields/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Admin: update registration field' })
  updateField(@Param('id') id: string, @Body() dto: UpdateRegistrationFieldDto) {
    return this.svc.updateRegistrationField(id, dto);
  }

  @Patch('registration-fields/:id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Admin: toggle field active/inactive' })
  toggleField(@Param('id') id: string) {
    return this.svc.toggleRegistrationField(id);
  }

  @Patch('registration-fields/:id/toggle-required')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Admin: toggle field required on/off' })
  toggleFieldRequired(@Param('id') id: string) {
    return this.svc.toggleFieldRequired(id);
  }

  @Patch('registration-fields/:id/toggle-visibility')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Admin: toggle field visibility (visible/hidden)' })
  toggleFieldVisibility(@Param('id') id: string) {
    return this.svc.toggleFieldVisibility(id);
  }

  @Delete('registration-fields/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Admin: soft-delete (deactivate) a registration field' })
  async deleteField(@Param('id') id: string) {
    await this.svc.deleteRegistrationField(id);
    return { success: true };
  }

  // ── Stage Field Management ────────────────────────────────────────────────────

  @Get('stage-fields/:stageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Admin: list fields belonging to a specific onboarding stage' })
  listStageFields(@Param('stageId') stageId: string) {
    return this.svc.listStageFields(stageId);
  }

  @Post('stage-fields')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Admin: add a field to an onboarding stage' })
  addFieldToStage(@Body() dto: AddStageFieldDto) {
    return this.svc.addFieldToStage(dto);
  }

  @Patch('stage-fields/:id/move')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Admin: move a field to a different stage (or back to registration form)' })
  moveFieldToStage(@Param('id') id: string, @Body() dto: { newStageId: string | null }) {
    return this.svc.moveFieldToStage(id, dto.newStageId);
  }

  // ── Subscription Plans ────────────────────────────────────────────────────────

  @Public() @Get('subscription-plans')
  @ApiOperation({ summary: 'List WL subscription plans (public)' })
  listPlans(@Query('all') all?: string) {
    return this.svc.listSubscriptionPlans(all !== 'true');
  }

  @Public() @Get('subscription-plans/:code')
  @ApiOperation({ summary: 'Get a subscription plan by packageCode (public)' })
  getPlan(@Param('code') code: string) {
    return this.svc.getSubscriptionPlan(code);
  }

  @Post('subscription-plans')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Admin: create a subscription plan' })
  async createPlan(@Body() dto: CreateSubscriptionPlanDto) {
    try {
      return await this.svc.createSubscriptionPlan(dto);
    } catch (err: any) {
      if (err.message?.includes('already exists')) throw new ConflictException(err.message);
      throw err;
    }
  }

  @Patch('subscription-plans/:code')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Admin: update a subscription plan' })
  updatePlan(@Param('code') code: string, @Body() dto: UpdateSubscriptionPlanDto) {
    return this.svc.updateSubscriptionPlan(code, dto);
  }

  // ── WL Domain Management ─────────────────────────────────────────────────────

  @Get('tenants/:tenantId/domain/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Get custom domain + subdomain status for a WL tenant' })
  getDomainStatus(@Param('tenantId') tenantId: string) {
    return this.wlDomain.getDomainStatus(tenantId);
  }

  @Post('tenants/:tenantId/domain')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Set custom domain for a WL tenant (starts PENDING_VERIFICATION)' })
  setDomain(@Param('tenantId') tenantId: string, @Body() body: { domain: string }) {
    return this.wlDomain.setDomain(tenantId, body.domain);
  }

  @Post('tenants/:tenantId/domain/verify')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Verify CNAME points to {slug}.wl.crmsoft.com — sets domainVerified=true' })
  verifyDomain(@Param('tenantId') tenantId: string) {
    return this.wlDomain.verifyDomain(tenantId);
  }

  @Delete('tenants/:tenantId/domain')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Remove custom domain from a WL tenant' })
  removeDomain(@Param('tenantId') tenantId: string) {
    return this.wlDomain.removeDomain(tenantId);
  }

  @Post('tenants/:tenantId/setup-subdomain')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Auto-assign subdomain from partnerCode (e.g. XTREME → xtreme.crmsoft.com)' })
  setupSubdomain(@Param('tenantId') tenantId: string) {
    return this.wlDomain.setupSubdomain(tenantId);
  }

  // ── WL Database Provisioning (PLATFORM_ADMIN only) ────────────────────────────

  @Get('tenants/:tenantId/provision/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Get dedicated DB provisioning status for a WL tenant' })
  getProvisionStatus(@Param('tenantId') tenantId: string) {
    return this.wlDbProv.getStatus(tenantId);
  }

  @Post('tenants/:tenantId/provision/start')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Generate DB provisioning script (sets status → PROVISIONING)' })
  startProvisioning(@Param('tenantId') tenantId: string) {
    return this.wlDbProv.startProvisioning(tenantId);
  }

  @Post('tenants/:tenantId/provision/confirm')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Store encrypted connection string and test connectivity (sets status → DEDICATED)' })
  confirmConnection(
    @Param('tenantId') tenantId: string,
    @Body() dto: ConfirmDbConnectionDto,
  ) {
    return this.wlDbProv.confirmConnection(tenantId, dto.connectionString);
  }

  @Post('tenants/:tenantId/provision/migrate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Return migration instructions for the dedicated DB (sets status → MIGRATING)' })
  getMigrationSql(@Param('tenantId') tenantId: string) {
    return this.wlDbProv.getMigrationSql(tenantId);
  }

  @Post('tenants/:tenantId/provision/seed')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Seed default data into the dedicated DB (roles, profile, sequences)' })
  seedTenantDb(@Param('tenantId') tenantId: string) {
    return this.wlDbProv.seedTenantDb(tenantId);
  }

  @Post('tenants/:tenantId/provision/rollback')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Revert to shared DB (clears encrypted connection, sets status → SHARED)' })
  rollbackProvisioning(@Param('tenantId') tenantId: string) {
    return this.wlDbProv.rollback(tenantId);
  }

  @Post('tenants/:tenantId/provision/migrate-data')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Migrate tenant data from shared DB → dedicated DB (runs 15 table groups)' })
  migrateData(@Param('tenantId') tenantId: string) {
    return this.migrationSvc.migrateToDeicatedDb(tenantId);
  }

  @Post('tenants/:tenantId/provision/cleanup')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Delete tenant data from shared DB (admin-confirmed, 30 days post-migration)' })
  cleanupSharedData(@Param('tenantId') tenantId: string) {
    return this.migrationSvc.cleanupSharedDbData(tenantId);
  }

  // ── Tenant Error Center (PLATFORM_ADMIN only) ─────────────────────────────────

  @Get('tenants/:tenantId/errors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Last 50 errors + 7-day trend for a specific tenant' })
  getTenantErrors(@Param('tenantId') tenantId: string) {
    return this.errorCenter.getTenantErrors(tenantId);
  }

  @Get('tenants/:tenantId/health')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Simplified health summary for a tenant (PLATFORM_ADMIN view)' })
  getTenantHealth(@Param('tenantId') tenantId: string) {
    return this.errorCenter.getTenantHealthSummary(tenantId);
  }

  // ── Partner Commission (PLATFORM_ADMIN only) ──────────────────────────────────

  @Get('commission/rules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PLATFORM_ADMIN')
  @ApiOperation({ summary: 'List all commission rules' })
  listCommissionRules(@Query('partnerCode') partnerCode?: string) {
    return this.commissionSvc.listRules(partnerCode);
  }

  @Post('commission/rules')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Create commission rule' })
  createCommissionRule(@Body() dto: CreateCommissionRuleDto) {
    return this.commissionSvc.createRule(dto);
  }

  @Patch('commission/rules/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Update commission rule' })
  updateCommissionRule(@Param('id') id: string, @Body() dto: UpdateCommissionRuleDto) {
    return this.commissionSvc.updateRule(id, dto);
  }

  @Delete('commission/rules/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Delete commission rule' })
  deleteCommissionRule(@Param('id') id: string) {
    return this.commissionSvc.deleteRule(id);
  }

  @Get('commission/logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Commission logs (filterable by partnerCode, status, date)' })
  getCommissionLogs(
    @Query('partnerCode') partnerCode?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.commissionSvc.getLogs(
      partnerCode,
      status,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Get('commission/summary/:partnerCode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PLATFORM_ADMIN')
  @ApiOperation({ summary: 'Revenue + commission summary for a partner' })
  getCommissionSummary(@Param('partnerCode') partnerCode: string) {
    return this.commissionSvc.getRevenueSummary(partnerCode);
  }
}
