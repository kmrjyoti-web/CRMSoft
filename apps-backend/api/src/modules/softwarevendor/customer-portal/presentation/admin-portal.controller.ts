import {
  Controller, Get, Post, Patch, Delete, Param, Body, HttpCode, HttpStatus,
} from '@nestjs/common';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CustomerPortalService, PORTAL_DEFAULT_ROUTES } from '../customer-portal.service';
import {
  CreateMenuCategoryDto, UpdateMenuCategoryDto,
  ActivatePortalDto, UpdatePageOverridesDto,
} from './dto/customer-portal.dto';

/**
 * Admin endpoints — manage the customer portal for a tenant.
 * All routes require the `customer_portal:manage` permission.
 */
@Controller('admin/customer-portal')
@RequirePermissions('customer_portal:manage')
export class AdminPortalController {
  constructor(private readonly service: CustomerPortalService) {}

  // ── Eligible Entities ─────────────────────────────────────────────────────

  /** GET /admin/customer-portal/eligible — verified contacts + organizations */
  @Get('eligible')
  async getEligible(@CurrentUser('tenantId') tenantId: string) {
    const data = await this.service.getEligibleEntities(tenantId);
    return ApiResponse.success(data);
  }

  // ── Portal Users ──────────────────────────────────────────────────────────

  /** GET /admin/customer-portal/users — list all portal users */
  @Get('users')
  async listUsers(@CurrentUser('tenantId') tenantId: string) {
    const data = await this.service.listPortalUsers(tenantId);
    return ApiResponse.success(data);
  }

  /** GET /admin/customer-portal/users/:id — get one portal user */
  @Get('users/:id')
  async getUser(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    const data = await this.service.getPortalUser(tenantId, id);
    return ApiResponse.success(data);
  }

  /** POST /admin/customer-portal/activate — activate portal for a contact/org/ledger */
  @Post('activate')
  @HttpCode(HttpStatus.CREATED)
  async activate(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ActivatePortalDto,
  ) {
    const data = await this.service.activatePortal(tenantId, userId, dto);
    return ApiResponse.success(data, 'Portal activated successfully');
  }

  /** PATCH /admin/customer-portal/users/:id — toggle active, assign category */
  @Patch('users/:id')
  async updateUser(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: { isActive?: boolean; menuCategoryId?: string | null },
  ) {
    const data = await this.service.updatePortalUser(tenantId, id, body);
    return ApiResponse.success(data);
  }

  /** PATCH /admin/customer-portal/users/:id/page-overrides — per-user page visibility */
  @Patch('users/:id/page-overrides')
  async updatePageOverrides(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePageOverridesDto,
  ) {
    const data = await this.service.updatePageOverrides(tenantId, id, dto);
    return ApiResponse.success(data, 'Page overrides saved');
  }

  /** POST /admin/customer-portal/users/:id/reset-password — admin resets password */
  @Post('users/:id/reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    const data = await this.service.resetUserPassword(tenantId, id);
    return ApiResponse.success(data, 'Temporary password generated');
  }

  /** DELETE /admin/customer-portal/users/:id — deactivate & soft-delete portal user */
  @Delete('users/:id')
  async deactivate(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    const data = await this.service.deactivatePortalUser(tenantId, id);
    return ApiResponse.success(data, 'Portal user deactivated');
  }

  // ── Menu Categories ───────────────────────────────────────────────────────

  /** GET /admin/customer-portal/menu-categories */
  @Get('menu-categories')
  async listCategories(@CurrentUser('tenantId') tenantId: string) {
    const data = await this.service.listCategories(tenantId);
    return ApiResponse.success(data);
  }

  /** POST /admin/customer-portal/menu-categories */
  @Post('menu-categories')
  @HttpCode(HttpStatus.CREATED)
  async createCategory(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateMenuCategoryDto,
  ) {
    const data = await this.service.createCategory(tenantId, userId, dto);
    return ApiResponse.success(data, 'Menu category created');
  }

  /** PATCH /admin/customer-portal/menu-categories/:id */
  @Patch('menu-categories/:id')
  async updateCategory(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMenuCategoryDto,
  ) {
    const data = await this.service.updateCategory(tenantId, id, dto);
    return ApiResponse.success(data, 'Menu category updated');
  }

  /** DELETE /admin/customer-portal/menu-categories/:id */
  @Delete('menu-categories/:id')
  async deleteCategory(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    const data = await this.service.deleteCategory(tenantId, id);
    return ApiResponse.success(data, 'Menu category deleted');
  }

  // ── Analytics ─────────────────────────────────────────────────────────────

  /** GET /admin/customer-portal/analytics */
  @Get('analytics')
  async getAnalytics(@CurrentUser('tenantId') tenantId: string) {
    const data = await this.service.getAnalytics(tenantId);
    return ApiResponse.success(data);
  }

  /** POST /admin/customer-portal/seed-defaults — seed standard menu categories */
  @Post('seed-defaults')
  @HttpCode(HttpStatus.OK)
  async seedDefaults(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.service.seedDefaultCategories(tenantId, userId);
    return ApiResponse.success(data, 'Default categories seeded');
  }

  /** GET /admin/customer-portal/available-routes — all possible portal routes */
  @Get('available-routes')
  getAvailableRoutes() {
    return ApiResponse.success(PORTAL_DEFAULT_ROUTES);
  }
}
