import {
  Controller, Get, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { VendorGuard } from '../infrastructure/vendor.guard';
import { LicenseService } from '../services/license.service';
import { ApiResponse } from '../../../common/utils/api-response';

@ApiTags('Vendor Licenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorGuard)
@Controller('vendor/licenses')
export class VendorLicensesController {
  constructor(private readonly licenseService: LicenseService) {}

  @Get()
  @ApiOperation({ summary: 'List all license keys with pagination' })
  async list(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.licenseService.listAll({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      status,
      search,
    });
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get license by ID' })
  async getById(@Param('id') id: string) {
    const license = await this.licenseService.getById(id);
    return ApiResponse.success(license);
  }
}
