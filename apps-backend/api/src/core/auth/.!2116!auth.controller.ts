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

  // --- 4 SEPARATE LOGIN ENDPOINTS ---

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

  // --- VENDOR LOGIN ---

  @Public()
  @Post('vendor/login')
  @HttpCode(HttpStatus.OK)
