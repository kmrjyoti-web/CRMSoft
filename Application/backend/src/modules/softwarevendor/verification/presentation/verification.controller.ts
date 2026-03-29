import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  HttpCode,
} from '@nestjs/common';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { VerificationService } from '../services/verification.service';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  // ─── GET STATUS ───
  @Get('status')
  async getStatus(@CurrentUser('id') userId: string) {
    return this.verificationService.getVerificationStatus(userId);
  }

  // ─── EMAIL VERIFICATION ───
  @Post('email/send')
  @HttpCode(200)
  async sendEmailOtp(@CurrentUser('id') userId: string, @Req() req: any) {
    return this.verificationService.sendEmailVerification(
      userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post('email/verify')
  @HttpCode(200)
  async verifyEmail(
    @CurrentUser('id') userId: string,
    @Body() body: { otp: string },
  ) {
    return this.verificationService.verifyEmail(userId, body.otp);
  }

  // ─── MOBILE VERIFICATION ───
  @Post('mobile/send')
  @HttpCode(200)
  async sendMobileOtp(@CurrentUser('id') userId: string, @Req() req: any) {
    return this.verificationService.sendMobileVerification(
      userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post('mobile/verify')
  @HttpCode(200)
  async verifyMobile(
    @CurrentUser('id') userId: string,
    @Body() body: { otp: string },
  ) {
    return this.verificationService.verifyMobile(userId, body.otp);
  }

  // ─── GST VERIFICATION ───
  @Post('gst/submit')
  @HttpCode(200)
  async submitGst(
    @CurrentUser('id') userId: string,
    @Body() body: {
      gstNumber: string;
      companyName: string;
      businessType?: string;
    },
  ) {
    return this.verificationService.submitGstForVerification(
      userId,
      body.gstNumber,
      body.companyName,
      body.businessType,
    );
  }

  @Post('gst/approve/:userId')
  @RequirePermissions('settings:update')
  @HttpCode(200)
  async approveGst(
    @CurrentUser('id') approvedById: string,
    @Param('userId') userId: string,
    @Body() body: { notes?: string },
  ) {
    return this.verificationService.approveGstManually(
      userId,
      approvedById,
      body.notes,
    );
  }

  // ─── CHECK ACTION PERMISSION ───
  @Get('can-perform/:action')
  async canPerformAction(
    @CurrentUser('id') userId: string,
    @Param('action') action: string,
  ) {
    const canPerform = await this.verificationService.canPerformAction(userId, action);
    return { action, canPerform };
  }
}
