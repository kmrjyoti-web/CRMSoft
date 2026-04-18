import {
  Controller, Get, Post, Delete, Patch, Param, Body, Query,
  ParseUUIDPipe, HttpCode, HttpStatus, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from '../../../../common/utils/api-response';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CompanyLocationsService } from '../services/company-locations.service';
import {
  AddCountryDto, AddStatesDto, AddCitiesDto, AddPincodesDto,
  AddPincodeRangeDto, CheckAreaDto,
} from './dto/company/company-locations.dto';

@ApiTags('Company Operating Locations')
@ApiBearerAuth()
@Controller('settings/locations')
export class CompanyLocationsController {
  constructor(private readonly svc: CompanyLocationsService) {}

  private getTenantId(req: any): string {
    return req.user?.tenantId ?? '';
  }

  // ─── Tree ───────────────────────────────────────────────────────────────────

  @Get('tree')
  @ApiOperation({ summary: 'Full operating location tree (countries→states→cities→pincodes)' })
  @RequirePermissions('locations:read')
  async getTree(@Request() req: any) {
    const tree = await this.svc.getLocationTree(this.getTenantId(req));
    return ApiResponse.success(tree);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Location summary counts' })
  @RequirePermissions('locations:read')
  async getSummary(@Request() req: any) {
    const summary = await this.svc.getSummary(this.getTenantId(req));
    return ApiResponse.success(summary);
  }

  // ─── Package Lookups ────────────────────────────────────────────────────────

  @Get('package/countries')
  @ApiOperation({ summary: 'All countries from country-state-city package' })
  @RequirePermissions('locations:read')
  async getAllCountries() {
    return ApiResponse.success(this.svc.getAllCountries());
  }

  @Get('package/states/:countryCode')
  @ApiOperation({ summary: 'States for a country from package' })
  @RequirePermissions('locations:read')
  async getStates(@Param('countryCode') countryCode: string) {
    return ApiResponse.success(this.svc.getStatesOfCountry(countryCode));
  }

  @Get('package/cities/:countryCode/:stateCode')
  @ApiOperation({ summary: 'Cities for a state from package' })
  @RequirePermissions('locations:read')
  async getCities(
    @Param('countryCode') countryCode: string,
    @Param('stateCode') stateCode: string,
  ) {
    return ApiResponse.success(this.svc.getCitiesOfState(countryCode, stateCode));
  }

  @Get('package/gst-codes')
  @ApiOperation({ summary: 'Indian GST state codes' })
  @RequirePermissions('locations:read')
  async getGstCodes() {
    return ApiResponse.success(this.svc.getGstStateCodes());
  }

  // ─── GST / Area Check ───────────────────────────────────────────────────────

  @Post('check-area')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if customer pincode/state is in operating area + GST type' })
  @RequirePermissions('locations:read')
  async checkArea(@Request() req: any, @Body() dto: CheckAreaDto) {
    const result = await this.svc.checkOperatingArea(this.getTenantId(req), dto);
    return ApiResponse.success(result);
  }

  @Get('gst-type/:customerStateCode')
  @ApiOperation({ summary: 'Determine INTRA or INTER state GST for a customer state' })
  @RequirePermissions('locations:read')
  async getGstType(@Request() req: any, @Param('customerStateCode') customerStateCode: string) {
    const result = await this.svc.determineGstType(this.getTenantId(req), customerStateCode);
    return ApiResponse.success(result);
  }

  // ─── Country CRUD ───────────────────────────────────────────────────────────

  @Post('countries')
  @ApiOperation({ summary: 'Add operating country' })
  @RequirePermissions('locations:create')
  async addCountry(@Request() req: any, @Body() dto: AddCountryDto) {
    const result = await this.svc.addCountry(this.getTenantId(req), dto);
    return ApiResponse.success(result, 'Country added');
  }

  @Delete('countries/:id')
  @ApiOperation({ summary: 'Remove operating country (cascades states→cities→pincodes)' })
  @RequirePermissions('locations:delete')
  async removeCountry(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    await this.svc.removeCountry(this.getTenantId(req), id);
    return ApiResponse.success(null, 'Country removed');
  }

  // ─── State CRUD ─────────────────────────────────────────────────────────────

  @Post('countries/:countryId/states')
  @ApiOperation({ summary: 'Add states to operating country' })
  @RequirePermissions('locations:create')
  async addStates(
    @Request() req: any,
    @Param('countryId', ParseUUIDPipe) countryId: string,
    @Body() dto: AddStatesDto,
  ) {
    const result = await this.svc.addStates(this.getTenantId(req), countryId, dto);
    return ApiResponse.success(result, 'States added');
  }

  @Patch('states/:id')
  @ApiOperation({ summary: 'Update state coverage / HQ / GSTIN' })
  @RequirePermissions('locations:update')
  async updateState(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { coverageType?: string; isHeadquarter?: boolean; stateGstin?: string },
  ) {
    await this.svc.updateState(this.getTenantId(req), id, body);
    return ApiResponse.success(null, 'State updated');
  }

  @Delete('states/:id')
  @ApiOperation({ summary: 'Remove state (cascades cities→pincodes)' })
  @RequirePermissions('locations:delete')
  async removeState(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    await this.svc.removeState(this.getTenantId(req), id);
    return ApiResponse.success(null, 'State removed');
  }

  // ─── City CRUD ──────────────────────────────────────────────────────────────

  @Post('states/:stateId/cities')
  @ApiOperation({ summary: 'Add cities to operating state' })
  @RequirePermissions('locations:create')
  async addCities(
    @Request() req: any,
    @Param('stateId', ParseUUIDPipe) stateId: string,
    @Body() dto: AddCitiesDto,
  ) {
    const result = await this.svc.addCities(this.getTenantId(req), stateId, dto);
    return ApiResponse.success(result, 'Cities added');
  }

  @Patch('cities/:id')
  @ApiOperation({ summary: 'Update city coverage' })
  @RequirePermissions('locations:update')
  async updateCity(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { coverageType?: string; district?: string },
  ) {
    await this.svc.updateCity(this.getTenantId(req), id, body);
    return ApiResponse.success(null, 'City updated');
  }

  @Delete('cities/:id')
  @ApiOperation({ summary: 'Remove city (cascades pincodes)' })
  @RequirePermissions('locations:delete')
  async removeCity(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    await this.svc.removeCity(this.getTenantId(req), id);
    return ApiResponse.success(null, 'City removed');
  }

  // ─── Pincode CRUD ───────────────────────────────────────────────────────────

  @Post('cities/:cityId/pincodes')
  @ApiOperation({ summary: 'Add pincodes to city (individual list)' })
  @RequirePermissions('locations:create')
  async addPincodes(
    @Request() req: any,
    @Param('cityId', ParseUUIDPipe) cityId: string,
    @Body() dto: AddPincodesDto,
  ) {
    const result = await this.svc.addPincodes(this.getTenantId(req), cityId, dto);
    return ApiResponse.success(result, 'Pincodes added');
  }

  @Post('cities/:cityId/pincodes/range')
  @ApiOperation({ summary: 'Add pincodes by range (e.g. 411001 to 411050)' })
  @RequirePermissions('locations:create')
  async addPincodeRange(
    @Request() req: any,
    @Param('cityId', ParseUUIDPipe) cityId: string,
    @Body() dto: AddPincodeRangeDto,
  ) {
    const result = await this.svc.addPincodeRange(this.getTenantId(req), cityId, dto);
    return ApiResponse.success(result, 'Pincode range added');
  }

  @Delete('pincodes/:id')
  @ApiOperation({ summary: 'Remove pincode' })
  @RequirePermissions('locations:delete')
  async removePincode(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    await this.svc.removePincode(this.getTenantId(req), id);
    return ApiResponse.success(null, 'Pincode removed');
  }
}
