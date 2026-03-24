import {
  Controller, Get, Post, Body, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CustomerPortalService, PORTAL_DEFAULT_ROUTES } from '../customer-portal.service';
import { ApiResponse } from '../../../../common/utils/api-response';
import {
  CustomerPortalLoginDto, RequestPasswordResetDto, ResetPasswordDto,
} from './dto/customer-portal.dto';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Public } from '../../../../common/decorators/roles.decorator';

/**
 * Customer-facing portal endpoints.
 * Login and password-reset are public. All other routes require JWT.
 */
@Controller('portal')
export class PortalController {
  constructor(private readonly service: CustomerPortalService) {}

  // ── Public ────────────────────────────────────────────────────────────────

  /** POST /portal/login */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CustomerPortalLoginDto,
  ) {
    const data = await this.service.login(tenantId, dto);
    return ApiResponse.success(data, 'Login successful');
  }

  /** POST /portal/forgot-password */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: RequestPasswordResetDto,
  ) {
    const data = await this.service.requestPasswordReset(tenantId, dto);
    return ApiResponse.success(data);
  }

  /** POST /portal/reset-password */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: ResetPasswordDto,
  ) {
    const data = await this.service.resetPassword(tenantId, dto);
    return ApiResponse.success(data);
  }

  // ── Public metadata ───────────────────────────────────────────────────────

  /** GET /portal/routes — all available portal route definitions */
  @Public()
  @Get('routes')
  getRoutes() {
    return ApiResponse.success(PORTAL_DEFAULT_ROUTES);
  }
}
