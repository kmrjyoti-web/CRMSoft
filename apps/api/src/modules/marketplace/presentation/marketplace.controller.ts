import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from '../../../common/utils/api-response';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { MarketplaceModuleService } from '../services/marketplace-module.service';
import { MarketplaceInstallService } from '../services/marketplace-install.service';
import { ReviewService } from '../services/review.service';
import {
  ListModulesQueryDto,
  CreateReviewDto,
  ListReviewsQueryDto,
  ActivateModuleDto,
} from './dto/marketplace.dto';

@ApiTags('Marketplace')
@ApiBearerAuth()
@Controller('marketplace')
export class MarketplaceController {
  constructor(
    private readonly moduleService: MarketplaceModuleService,
    private readonly installService: MarketplaceInstallService,
    private readonly reviewService: ReviewService,
  ) {}

  // ─── Public Module Browsing ─────────────────────────

  @Get('modules')
  @ApiOperation({ summary: 'List published marketplace modules' })
  async listModules(@Query() query: ListModulesQueryDto) {
    const result = await this.moduleService.listPublished(query);
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('modules/featured')
  @ApiOperation({ summary: 'Get featured marketplace modules' })
  async getFeatured() {
    const modules = await this.moduleService.getFeatured();
    return ApiResponse.success(modules, 'Featured modules');
  }

  @Get('modules/:code')
  @ApiOperation({ summary: 'Get module detail by code' })
  async getModuleDetail(@Param('code') code: string) {
    const mod = await this.moduleService.getDetail(code);
    return ApiResponse.success(mod);
  }

  // ─── Install / Activate / Cancel ────────────────────

  @Post('modules/:id/install')
  @ApiOperation({ summary: 'Install a module (start trial)' })
  async installModule(
    @Param('id', ParseUUIDPipe) moduleId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const installation = await this.installService.install(tenantId, moduleId);
    return ApiResponse.success(installation, 'Module installed (trial started)');
  }

  @Post('modules/:id/activate')
  @ApiOperation({ summary: 'Activate module subscription' })
  async activateModule(
    @Param('id', ParseUUIDPipe) moduleId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: ActivateModuleDto,
  ) {
    const installation = await this.installService.activate(
      tenantId,
      moduleId,
      dto.subscriptionId,
      dto.planId,
    );
    return ApiResponse.success(installation, 'Module activated');
  }

  @Delete('modules/:id/install')
  @ApiOperation({ summary: 'Cancel/uninstall a module' })
  async cancelModule(
    @Param('id', ParseUUIDPipe) moduleId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.installService.cancel(tenantId, moduleId);
    return ApiResponse.success(result, 'Module cancelled');
  }

  @Get('installed')
  @ApiOperation({ summary: 'List tenant installed modules' })
  async listInstalled(@CurrentUser('tenantId') tenantId: string) {
    const installations = await this.installService.listInstalled(tenantId);
    return ApiResponse.success(installations);
  }

  // ─── Reviews ────────────────────────────────────────

  @Post('modules/:id/reviews')
  @ApiOperation({ summary: 'Submit a review for a module' })
  async submitReview(
    @Param('id', ParseUUIDPipe) moduleId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateReviewDto,
  ) {
    const review = await this.reviewService.create(tenantId, moduleId, dto);
    return ApiResponse.success(review, 'Review submitted');
  }

  @Get('modules/:id/reviews')
  @ApiOperation({ summary: 'List reviews for a module' })
  async listReviews(
    @Param('id', ParseUUIDPipe) moduleId: string,
    @Query() query: ListReviewsQueryDto,
  ) {
    const page = +(query.page || '1');
    const limit = +(query.limit || '10');
    const result = await this.reviewService.listForModule(moduleId, page, limit);
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }
}
