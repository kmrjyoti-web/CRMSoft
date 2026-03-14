import {
  Controller, Post, Get, Param, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto, RegisterDto, RefreshTokenDto, ChangePasswordDto,
  CustomerRegisterDto, PartnerRegisterDto, TenantRegisterDto,
} from './dto/auth.dto';
import { Public, Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiResponse } from '../../common/utils/api-response';
import { PermissionChainService } from '../permissions/services/permission-chain.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private permissionChain: PermissionChainService,
  ) {}

  // ─── 4 SEPARATE LOGIN ENDPOINTS ───

  @Public()
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin Portal Login' })
  async adminLogin(@Body() dto: LoginDto) {
    return ApiResponse.success(
      await this.auth.adminLogin(dto.email, dto.password),
      'Admin login successful',
    );
  }

  @Public()
  @Post('employee/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Employee Portal Login' })
  async employeeLogin(@Body() dto: LoginDto) {
    return ApiResponse.success(
      await this.auth.employeeLogin(dto.email, dto.password),
      'Employee login successful',
    );
  }

  @Public()
  @Post('customer/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Customer Portal Login' })
  async customerLogin(@Body() dto: LoginDto) {
    return ApiResponse.success(
      await this.auth.customerLogin(dto.email, dto.password),
      'Customer login successful',
    );
  }

  @Public()
  @Post('partner/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Referral Partner Portal Login' })
  async partnerLogin(@Body() dto: LoginDto) {
    return ApiResponse.success(
      await this.auth.partnerLogin(dto.email, dto.password),
      'Partner login successful',
    );
  }

  // ─── VENDOR LOGIN ───

  @Public()
  @Post('vendor/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vendor Portal Login — VENDORS ONLY' })
  async vendorLogin(@Body() dto: LoginDto) {
    return ApiResponse.success(
      await this.auth.vendorLogin(dto.email, dto.password),
      'Vendor login successful',
    );
  }

  // ─── SUPER ADMIN LOGIN ───

  @Public()
  @Post('super-admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Platform Super Admin Login' })
  async superAdminLogin(@Body() dto: LoginDto) {
    return ApiResponse.success(
      await this.auth.superAdminLogin(dto.email, dto.password),
      'Super admin login successful',
    );
  }

  // ─── SELF-REGISTRATION (public) ───

  @Public()
  @Post('customer/register')
  @ApiOperation({ summary: 'Customer Self-Registration (public)' })
  async customerRegister(@Body() dto: CustomerRegisterDto) {
    return ApiResponse.success(
      await this.auth.registerCustomer(dto),
      'Customer registered',
    );
  }

  @Public()
  @Post('partner/register')
  @ApiOperation({ summary: 'Referral Partner Self-Registration (public)' })
  async partnerRegister(@Body() dto: PartnerRegisterDto) {
    return ApiResponse.success(
      await this.auth.registerPartner(dto),
      'Partner registered',
    );
  }

  @Public()
  @Get('tenant/check-slug/:slug')
  @ApiOperation({ summary: 'Check if company slug is available (public)' })
  async checkSlug(@Param('slug') slug: string) {
    const available = await this.auth.isSlugAvailable(slug);
    return ApiResponse.success({ available });
  }

  @Public()
  @Post('tenant/register')
  @ApiOperation({ summary: 'Tenant Self-Registration (public)' })
  async tenantRegister(@Body() dto: TenantRegisterDto) {
    return ApiResponse.success(
      await this.auth.registerTenant(dto),
      'Registration successful',
    );
  }

  // ─── ADMIN CREATES STAFF ───

  @Post('staff/register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin creates Admin/Employee (requires ADMIN role)' })
  async registerStaff(@Body() dto: RegisterDto, @CurrentUser('id') userId: string) {
    return ApiResponse.success(
      await this.auth.registerStaff({ ...dto, createdBy: userId }),
      'Staff registered',
    );
  }

  // ─── SHARED ───

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh token (all user types)' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return ApiResponse.success(
      await this.auth.refreshToken(dto.refreshToken),
      'Token refreshed',
    );
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password (all user types)' })
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser('id') userId: string,
  ) {
    return ApiResponse.success(
      await this.auth.changePassword(userId, dto.currentPassword, dto.newPassword),
    );
  }

  @Get('permissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user effective permissions' })
  async permissions(@CurrentUser() user: any) {
    // Super admin gets ALL permissions
    if (user.isSuperAdmin) {
      const all = await this.permissionChain.getAllPermissionCodes();
      return ApiResponse.success(all);
    }
    // Vendors get ALL permissions (they manage their own portal)
    if (user.vendorId || user.userType === 'VENDOR') {
      const all = await this.permissionChain.getAllPermissionCodes();
      return ApiResponse.success(all);
    }
    const codes = await this.permissionChain.getEffectivePermissions(user.id);
    return ApiResponse.success(codes);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile (all user types)' })
  async me(@CurrentUser() user: any) {
    if (user.isSuperAdmin) {
      const admin = await this.auth.getSuperAdminProfile(user.id);
      return ApiResponse.success(admin);
    }
    if (user.vendorId || user.userType === 'VENDOR') {
      const vendor = await this.auth.getVendorProfile(user.vendorId ?? user.sub);
      return ApiResponse.success(vendor);
    }
    return ApiResponse.success(await this.auth.getProfile(user.id));
  }
}
