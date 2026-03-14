import { Controller, Get, Post, Body, Param, Query, HttpCode, Res } from '@nestjs/common';
import { Response } from 'express';
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

  // ── Report endpoints ───────────────────────────────────

  @Get('report/summary')
  async getReportSummary(
    @CurrentUser() user: any,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const result = await this.service.getReportSummary(user.tenantId ?? '', dateFrom, dateTo);
    return ApiResponse.success(result);
  }

  @Get('report/list')
  async getReportList(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('channel') channel?: string,
    @Query('mode') mode?: string,
    @Query('entityType') entityType?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.service.getReportList(user.tenantId ?? '', {
      status, channel, mode, entityType, dateFrom, dateTo, search,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    return ApiResponse.success(result);
  }

  @Get('report/expired-links')
  async getExpiredLinks(@CurrentUser() user: any) {
    const result = await this.service.getExpiredLinks(user.tenantId ?? '');
    return ApiResponse.success(result);
  }

  @Get('report/trend')
  async getVerificationTrend(
    @CurrentUser() user: any,
    @Query('days') days?: string,
  ) {
    const result = await this.service.getVerificationTrend(
      user.tenantId ?? '', days ? parseInt(days) : 30,
    );
    return ApiResponse.success(result);
  }

  @Get('report/export')
  async exportCsv(
    @CurrentUser() user: any,
    @Res() res: Response,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const csv = await this.service.exportCsv(user.tenantId ?? '', { status, dateFrom, dateTo });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=verification-report-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  }
}
