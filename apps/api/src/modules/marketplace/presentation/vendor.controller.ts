import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from '../../../common/utils/api-response';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { VendorService } from '../services/vendor.service';
import { MarketplaceModuleService } from '../services/marketplace-module.service';
import {
  RegisterVendorDto,
  ListVendorsQueryDto,
  CreateModuleDto,
  UpdateModuleDto,
} from './dto/marketplace.dto';

@ApiTags('Marketplace Vendors')
@ApiBearerAuth()
@Controller('marketplace/vendors')
export class VendorController {
  constructor(
    private readonly vendorService: VendorService,
    private readonly moduleService: MarketplaceModuleService,
  ) {}

  // ─── Vendor Registration & Admin ────────────────────

  @Post()
  @ApiOperation({ summary: 'Register a new vendor' })
  async register(@Body() dto: RegisterVendorDto) {
    const vendor = await this.vendorService.register(dto);
    return ApiResponse.success(vendor, 'Vendor registration submitted');
  }

  @Get()
  @ApiOperation({ summary: 'List all vendors (admin)' })
  @RequirePermissions('marketplace:admin')
  async listVendors(@Query() query: ListVendorsQueryDto) {
    const result = await this.vendorService.listAll(query);
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vendor details' })
  async getVendor(@Param('id', ParseUUIDPipe) id: string) {
    const vendor = await this.vendorService.getById(id);
    return ApiResponse.success(vendor);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve a vendor (admin)' })
  @RequirePermissions('marketplace:admin')
  async approveVendor(@Param('id', ParseUUIDPipe) id: string) {
    const vendor = await this.vendorService.approve(id);
    return ApiResponse.success(vendor, 'Vendor approved');
  }

  @Put(':id/suspend')
  @ApiOperation({ summary: 'Suspend a vendor (admin)' })
  @RequirePermissions('marketplace:admin')
  async suspendVendor(@Param('id', ParseUUIDPipe) id: string) {
    const vendor = await this.vendorService.suspend(id);
    return ApiResponse.success(vendor, 'Vendor suspended');
  }

  // ─── Module Management (Vendor) ─────────────────────

  @Post(':vendorId/modules')
  @ApiOperation({ summary: 'Create a module draft (vendor)' })
  async createModule(
    @Param('vendorId', ParseUUIDPipe) vendorId: string,
    @Body() dto: CreateModuleDto,
  ) {
    const mod = await this.moduleService.create(vendorId, dto);
    return ApiResponse.success(mod, 'Module draft created');
  }

  @Put('modules/:id')
  @ApiOperation({ summary: 'Update a module (vendor)' })
  async updateModule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateModuleDto,
  ) {
    const mod = await this.moduleService.update(id, dto);
    return ApiResponse.success(mod, 'Module updated');
  }

  @Put('modules/:id/submit')
  @ApiOperation({ summary: 'Submit module for review (vendor)' })
  async submitForReview(@Param('id', ParseUUIDPipe) id: string) {
    const mod = await this.moduleService.submitForReview(id);
    return ApiResponse.success(mod, 'Module submitted for review');
  }

  @Put('modules/:id/publish')
  @ApiOperation({ summary: 'Publish a module (admin)' })
  @RequirePermissions('marketplace:admin')
  async publishModule(@Param('id', ParseUUIDPipe) id: string) {
    const mod = await this.moduleService.publish(id);
    return ApiResponse.success(mod, 'Module published');
  }
}
