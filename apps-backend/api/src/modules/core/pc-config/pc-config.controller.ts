import {
  Controller, Get, Post, Body, Param, Query,
  ConflictException, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PcConfigService } from './pc-config.service';

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
}

@Controller('pc-config')
export class PcConfigController {
  constructor(private readonly svc: PcConfigService) {}

  // 1. GET /pc-config/partners
  @Get('partners')
  listPartners() {
    return this.svc.listPartners();
  }

  // 2. GET /pc-config/partner/:code
  @Get('partner/:code')
  getPartner(@Param('code') code: string) {
    return this.svc.getPartner(code);
  }

  // 3. GET /pc-config/crm-editions
  @Get('crm-editions')
  listCrmEditions() {
    return this.svc.listCrmEditions();
  }

  // 4. GET /pc-config/brands
  @Get('brands')
  listBrands() {
    return this.svc.listBrands();
  }

  // 5. GET /pc-config/brand/:code  (enriched with editions + verticals)
  @Get('brand/:code')
  getBrand(@Param('code') code: string) {
    return this.svc.getBrand(code);
  }

  // 6. GET /pc-config/verticals?crmEdition=TRAVEL
  @Get('verticals')
  listVerticals(@Query('crmEdition') crmEdition?: string) {
    return this.svc.listVerticals(crmEdition);
  }

  // 7. GET /pc-config/sub-types?vertical=TRAVEL_TOURISM&userType=B2B
  @Get('sub-types')
  listSubTypes(
    @Query('vertical') vertical: string,
    @Query('userType') userType: string,
  ) {
    return this.svc.listSubTypes(vertical, userType);
  }

  // 8. GET /pc-config/combined-code/:code
  @Get('combined-code/:code')
  getCombinedCode(@Param('code') code: string) {
    return this.svc.getCombinedCode(code);
  }

  // 9. GET /pc-config/registration-form?combinedCode=B2B_TRAV_TRAVL_DMC
  @Get('registration-form')
  getRegistrationForm(@Query('combinedCode') combinedCode: string) {
    return this.svc.getRegistrationFields(combinedCode);
  }

  // 10. GET /pc-config/onboarding-stages?combinedCode=...
  @Get('onboarding-stages')
  getOnboardingStages(@Query('combinedCode') combinedCode?: string) {
    return this.svc.getOnboardingStages(combinedCode);
  }

  // 11. GET /pc-config/page-registry?portal=crm
  @Get('page-registry')
  listPageRegistry(@Query('portal') portal?: string) {
    return this.svc.listPageRegistry(portal);
  }

  // 12. GET /pc-config/combined-codes?brandCode=TRAVELSIS
  @Get('combined-codes')
  listCombinedCodes(@Query('brandCode') brandCode?: string) {
    return this.svc.listCombinedCodes(brandCode);
  }

  // 13. POST /pc-config/combined-code  (admin — create new code)
  @Post('combined-code')
  @HttpCode(HttpStatus.CREATED)
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
