import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CentralAuthService } from './central-auth.service';
import { CentralLoginDto, SelectTenantDto, SsoVerifyDto } from './dto/auth.dto';
import { Public } from '../../common/decorators/roles.decorator';
import { ApiResponse } from '../../common/utils/api-response';

@ApiTags('Central Auth')
@Controller('auth')
export class CentralAuthController {
  constructor(private readonly centralAuth: CentralAuthService) {}

  /**
   * Central portal login (app.crmsoft.com).
   * Returns SINGLE (auto-SSO) | MULTI (tenant picker) | NO_COMPANY.
   * Rate-limited: 10 attempts / email / hour.
   */
  @Public()
  @Post('central-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Central portal login — resolves to SSO redirect or tenant picker' })
  async centralLogin(@Body() dto: CentralLoginDto) {
    return ApiResponse.success(
      await this.centralAuth.centralLogin(dto.email, dto.password),
      'Central login processed',
    );
  }

  /**
   * Tenant selection after multi-company login.
   * Consumes session token (one-time) and returns SSO token + redirect URL.
   */
  @Public()
  @Post('central-login/select')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Select tenant from multi-company session — returns SSO redirect' })
  async selectTenant(@Body() dto: SelectTenantDto) {
    return ApiResponse.success(
      await this.centralAuth.selectTenant(dto.sessionToken, dto.companyId),
      'Tenant selected',
    );
  }

  /**
   * SSO token verification on the brand portal side.
   * Consumes SSO token (one-time, 60s TTL) and issues full JWT.
   */
  @Public()
  @Post('sso/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify SSO token and issue brand portal JWT (one-time, 60s window)' })
  async verifySso(@Body() dto: SsoVerifyDto) {
    return ApiResponse.success(
      await this.centralAuth.verifySso(dto.ssoToken),
      'SSO verified',
    );
  }
}
