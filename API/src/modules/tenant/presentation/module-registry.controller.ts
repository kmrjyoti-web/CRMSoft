import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { VendorGuard } from '../infrastructure/vendor.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import {
  ModuleRegistryService,
  ModuleFeature,
} from '../services/module-registry.service';

@ApiTags('Module Registry')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorGuard)
@Controller('vendor/module-registry')
export class ModuleRegistryController {
  constructor(
    private readonly moduleRegistryService: ModuleRegistryService,
  ) {}

  // ─── 1. List modules ──────────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'List module definitions with filtering and pagination' })
  async list(
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const { data, total } = await this.moduleRegistryService.list({
      category,
      status,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    const p = Math.max(Number(page) || 1, 1);
    const l = Math.min(Math.max(Number(limit) || 20, 1), 100);

    return ApiResponse.paginated(data, total, p, l);
  }

  // ─── 2. Get by ID ─────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Get a module definition by ID' })
  async getById(@Param('id') id: string) {
    const module = await this.moduleRegistryService.getById(id);
    return ApiResponse.success(module);
  }

  // ─── 3. Create module ─────────────────────────────────────────────
  @Post()
  @ApiOperation({ summary: 'Create a new module definition' })
  async create(
    @Body()
    body: {
      code: string;
      name: string;
      description?: string;
      category: string;
      version?: string;
      moduleStatus?: string;
      isCore?: boolean;
      iconName?: string;
      sortOrder?: number;
      dependsOn?: string[];
      features?: ModuleFeature[];
      menuKeys?: string[];
      defaultPricingType?: string;
      basePrice?: number;
      priceMonthly?: number;
      priceYearly?: number;
      oneTimeSetupFee?: number;
      trialDays?: number;
      trialFeatures?: string[];
      usagePricing?: Record<string, number>;
      isFeatured?: boolean;
      isActive?: boolean;
    },
  ) {
    const module = await this.moduleRegistryService.create(body);
    return ApiResponse.success(module, 'Module definition created');
  }

  // ─── 4. Update module ─────────────────────────────────────────────
  @Patch(':id')
  @ApiOperation({ summary: 'Update a module definition' })
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      category?: string;
      version?: string;
      moduleStatus?: string;
      isCore?: boolean;
      iconName?: string;
      sortOrder?: number;
      dependsOn?: string[];
      features?: ModuleFeature[];
      menuKeys?: string[];
      defaultPricingType?: string;
      basePrice?: number;
      priceMonthly?: number;
      priceYearly?: number;
      oneTimeSetupFee?: number;
      trialDays?: number;
      trialFeatures?: string[];
      usagePricing?: Record<string, number>;
      isFeatured?: boolean;
      isActive?: boolean;
    },
  ) {
    const module = await this.moduleRegistryService.update(id, body);
    return ApiResponse.success(module, 'Module definition updated');
  }

  // ─── 5. Archive (soft delete) ─────────────────────────────────────
  @Delete(':id')
  @ApiOperation({ summary: 'Archive a module definition (soft delete)' })
  async archive(@Param('id') id: string) {
    const module = await this.moduleRegistryService.archive(id);
    return ApiResponse.success(module, 'Module definition archived');
  }

  // ─── 6. Add feature ───────────────────────────────────────────────
  @Post(':id/features')
  @ApiOperation({ summary: 'Add a feature to a module definition' })
  async addFeature(
    @Param('id') id: string,
    @Body()
    body: {
      code: string;
      name: string;
      type: 'PAGE' | 'WIDGET' | 'REPORT' | 'ACTION';
      menuKey?: string;
      isDefault?: boolean;
    },
  ) {
    const module = await this.moduleRegistryService.addFeature(id, body);
    return ApiResponse.success(module, 'Feature added');
  }

  // ─── 7. Update feature ────────────────────────────────────────────
  @Patch(':id/features/:code')
  @ApiOperation({ summary: 'Update a feature within a module definition' })
  async updateFeature(
    @Param('id') id: string,
    @Param('code') code: string,
    @Body()
    body: {
      name?: string;
      type?: 'PAGE' | 'WIDGET' | 'REPORT' | 'ACTION';
      menuKey?: string;
      isDefault?: boolean;
    },
  ) {
    const module = await this.moduleRegistryService.updateFeature(id, code, body);
    return ApiResponse.success(module, 'Feature updated');
  }

  // ─── 8. Remove feature ────────────────────────────────────────────
  @Delete(':id/features/:code')
  @ApiOperation({ summary: 'Remove a feature from a module definition' })
  async removeFeature(
    @Param('id') id: string,
    @Param('code') code: string,
  ) {
    const module = await this.moduleRegistryService.removeFeature(id, code);
    return ApiResponse.success(module, 'Feature removed');
  }

  // ─── 9. Set menu keys ─────────────────────────────────────────────
  @Post(':id/menu-keys')
  @ApiOperation({ summary: 'Set menu keys for a module definition' })
  async setMenuKeys(
    @Param('id') id: string,
    @Body() body: { menuKeys: string[] },
  ) {
    const module = await this.moduleRegistryService.setMenuKeys(id, body.menuKeys);
    return ApiResponse.success(module, 'Menu keys updated');
  }

  // ─── 10. Get dependency tree ──────────────────────────────────────
  @Get(':id/dependencies')
  @ApiOperation({ summary: 'Get the recursive dependency tree for a module' })
  async getDependencyTree(@Param('id') id: string) {
    const tree = await this.moduleRegistryService.getDependencyTree(id);
    return ApiResponse.success(tree);
  }

  // ─── 11. Set dependencies ─────────────────────────────────────────
  @Post(':id/dependencies')
  @ApiOperation({ summary: 'Set dependency codes for a module definition' })
  async setDependencies(
    @Param('id') id: string,
    @Body() body: { dependsOn: string[] },
  ) {
    const module = await this.moduleRegistryService.setDependencies(id, body.dependsOn);
    return ApiResponse.success(module, 'Dependencies updated');
  }

  // ─── 12. Get subscribers ──────────────────────────────────────────
  @Get(':id/subscribers')
  @ApiOperation({ summary: 'List tenants subscribed to this module' })
  async getSubscribers(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = Math.max(Number(page) || 1, 1);
    const l = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const { data, total } = await this.moduleRegistryService.getSubscribers(id, {
      page: p,
      limit: l,
    });

    return ApiResponse.paginated(data, total, p, l);
  }
}
