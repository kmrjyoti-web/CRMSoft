import { Controller, Get, Post, Body, Param, HttpCode } from '@nestjs/common';
import { EntityVerificationService } from '../services/entity-verification.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { InitiateVerificationDto, VerifyOtpDto } from './dto/entity-verification.dto';

@Controller('entity-verification')
export class EntityVerificationController {
  constructor(private readonly service: EntityVerificationService) {}

  @Post('initiate')
  @HttpCode(200)
  async initiate(@CurrentUser() user: any, @Body() dto: InitiateVerificationDto) {
    const result = await this.service.initiateVerification(
      user.tenantId ?? '', user.id,
      `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email,
      dto,
    );
    return ApiResponse.success(result);
  }

  @Post('verify-otp')
  @HttpCode(200)
  async verifyOtp(@CurrentUser() user: any, @Body() dto: VerifyOtpDto) {
    const result = await this.service.verifyOtp(user.tenantId ?? '', dto.recordId, dto.otp);
    return ApiResponse.success(result);
  }

  @Post('resend/:recordId')
  @HttpCode(200)
  async resend(@CurrentUser() user: any, @Param('recordId') recordId: string) {
    const result = await this.service.resend(
      user.tenantId ?? '', user.id,
      `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email,
      recordId,
    );
    return ApiResponse.success(result);
  }

  @Get('history/:entityType/:entityId')
  async getHistory(
    @CurrentUser() user: any,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    const result = await this.service.getHistory(user.tenantId ?? '', entityType, entityId);
    return ApiResponse.success(result);
  }

  @Get('status/:entityType/:entityId')
  async getStatus(
    @CurrentUser() user: any,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    const result = await this.service.getStatus(user.tenantId ?? '', entityType, entityId);
    return ApiResponse.success(result);
  }

  @Get('pending')
  async getPending(@CurrentUser() user: any) {
    const result = await this.service.getPending(user.tenantId ?? '');
    return ApiResponse.success(result);
  }

  @Post('expire-old')
  @HttpCode(200)
  async expireOld() {
    const result = await this.service.expireOld();
    return ApiResponse.success(result);
  }
}
