import {
  Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus, Req, Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { OnboardingService } from './onboarding.service';
import { SelectLocaleDto, SendOtpDto, VerifyOtpDto, SelectUserTypeDto, SetSubTypeDto, CompleteProfileDto } from './dto/onboarding.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { SkipTenantGuard } from '../../../../common/decorators/roles.decorator';

@ApiTags('Onboarding')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@SkipTenantGuard()
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get onboarding status for current user' })
  async getStatus(@CurrentUser('id') userId: string) {
    return ApiResponse.success(await this.onboarding.getStatus(userId));
  }

  @Get('status-v2')
  @ApiOperation({ summary: 'M5 — Config-driven status with componentName + per-brand stages' })
  async getStatusV2(@CurrentUser('id') userId: string) {
    return ApiResponse.success(await this.onboarding.getStatusV2(userId));
  }

  @Post('custom-stage/:stageKey/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'M5 — Complete a custom (non-standard) onboarding stage' })
  async completeCustomStage(
    @CurrentUser('id') userId: string,
    @Param('stageKey') stageKey: string,
    @Body() data: Record<string, any>,
  ) {
    return ApiResponse.success(
      await this.onboarding.completeCustomStage(userId, stageKey, data),
      'Stage completed',
    );
  }

  @Post('locale')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stage 1 — select preferred locale' })
  async selectLocale(
    @CurrentUser('id') userId: string,
    @Body() dto: SelectLocaleDto,
  ) {
    return ApiResponse.success(
      await this.onboarding.selectLocale(userId, dto.locale),
      'Locale saved',
    );
  }

  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to email or mobile' })
  async sendOtp(
    @CurrentUser('id') userId: string,
    @Body() dto: SendOtpDto,
    @Req() req: Request,
  ) {
    const ip = req.ip;
    const ua = req.headers['user-agent'];
    return ApiResponse.success(
      await this.onboarding.sendOtp(userId, dto.type, ip, ua),
      `OTP sent to your ${dto.type}`,
    );
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP for email or mobile' })
  async verifyOtp(
    @CurrentUser('id') userId: string,
    @Body() dto: VerifyOtpDto,
  ) {
    return ApiResponse.success(
      await this.onboarding.verifyOtp(userId, dto.type, dto.code),
      `${dto.type} verified`,
    );
  }

  @Post('otp/skip-mobile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Skip mobile verification (optional step)' })
  async skipMobile(@CurrentUser('id') userId: string) {
    return ApiResponse.success(
      await this.onboarding.skipMobile(userId),
      'Mobile verification skipped',
    );
  }

  @Post('user-type')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stage 4 — select user/business type' })
  async selectUserType(
    @CurrentUser('id') userId: string,
    @Body() dto: SelectUserTypeDto,
  ) {
    return ApiResponse.success(
      await this.onboarding.selectUserType(userId, dto.userType),
      'User type saved',
    );
  }

  @Post('sub-type')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stage 5 — select sub-type (DMC, Agent, etc.)' })
  async setSubType(
    @CurrentUser('id') userId: string,
    @Body() dto: SetSubTypeDto,
  ) {
    return ApiResponse.success(
      await this.onboarding.setSubType(userId, dto),
      'Sub-type saved',
    );
  }

  @Post('complete-profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete profile and finish onboarding' })
  async completeProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: CompleteProfileDto,
  ) {
    return ApiResponse.success(
      await this.onboarding.completeProfile(userId, dto),
      'Onboarding complete',
    );
  }
}
