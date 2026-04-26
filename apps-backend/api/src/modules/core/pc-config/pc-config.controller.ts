import {
  Controller, Get, Post, Body, Param, Query,
  ConflictException, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, MinLength, IsArray, IsBoolean, IsInt, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PcConfigService } from './pc-config.service';
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
  constructor(private readonly svc: PcConfigService) {}

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
  getCombinedCode(@Param('code') code: string) { return this.svc.getCombinedCode(code); }

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

  @Public() @Get('combined-codes')
  listCombinedCodes(@Query('brandCode') brandCode?: string) {
    return this.svc.listCombinedCodes(brandCode);
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

  @Post('combined-code')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN')
  @ApiOperation({ summary: 'M3 — Create a new combined code (builder save action)' })
  async createCombinedCode(@Body() dto: CreateCombinedCodeDto) {
    try {
      return await this.svc.createCombinedCode(dto);
    } catch (err: any) {
      if (err.message?.includes('already exists')) throw new ConflictException(err.message);
      throw err;
    }
  }
}
