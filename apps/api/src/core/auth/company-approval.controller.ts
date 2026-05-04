import {
  Controller, Get, Post, Param, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/utils/api-response';
import { CompanyApprovalService } from './company-approval.service';

class RejectMemberDto {
  @ApiPropertyOptional({ example: 'Profile incomplete or not eligible' })
  @IsString() reason: string;
}

class SubscriptionRequestDto {
  @ApiPropertyOptional({ example: 'We want to collaborate on B2B orders' })
  @IsOptional() @IsString() reason?: string;
}

@ApiTags('Company — Approval Queue')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId')
export class CompanyApprovalController {
  constructor(private readonly approvalService: CompanyApprovalService) {}

  // ── Pending member approval ────────────────────────────────────────────────

  @Get('pending-members')
  @ApiOperation({ summary: 'List PENDING membership requests for this company (OWNER/ADMIN only)' })
  async listPendingMembers(
    @Param('companyId') companyId: string,
    @CurrentUser('id') userId: string,
  ) {
    return ApiResponse.success(await this.approvalService.listPendingMembers(companyId, userId));
  }

  @Post('members/:mappingId/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a PENDING member (OWNER/ADMIN only)' })
  async approveMember(
    @Param('companyId') companyId: string,
    @Param('mappingId') mappingId: string,
    @CurrentUser('id') userId: string,
  ) {
    return ApiResponse.success(
      await this.approvalService.approveMember(companyId, mappingId, userId),
      'Member approved',
    );
  }

  @Post('members/:mappingId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a PENDING member (OWNER/ADMIN only)' })
  async rejectMember(
    @Param('companyId') companyId: string,
    @Param('mappingId') mappingId: string,
    @Body() dto: RejectMemberDto,
    @CurrentUser('id') userId: string,
  ) {
    return ApiResponse.success(
      await this.approvalService.rejectMember(companyId, mappingId, userId, dto.reason),
      'Member rejected',
    );
  }

  // ── Subscription requests (Company → Company) ─────────────────────────────

  @Post('subscription-requests')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Request to subscribe this company to another company (Company→Company)' })
  async createSubscriptionRequest(
    @Param('companyId') companyId: string,
    @Body() dto: SubscriptionRequestDto & { targetCompanyId: string },
    @CurrentUser('id') userId: string,
  ) {
    return ApiResponse.success(
      await this.approvalService.createSubscriptionRequest({
        requesterCompanyId: companyId,
        targetCompanyId: dto.targetCompanyId,
        requesterUserId: userId,
        reason: dto.reason,
      }),
      'Subscription request sent',
    );
  }

  @Get('subscription-requests')
  @ApiOperation({ summary: 'List pending subscription requests to this company (OWNER/ADMIN only)' })
  async listSubscriptionRequests(
    @Param('companyId') companyId: string,
    @CurrentUser('id') userId: string,
  ) {
    return ApiResponse.success(
      await this.approvalService.listSubscriptionRequests(companyId, userId),
    );
  }

  @Post('subscription-requests/:requestId/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a subscription request (OWNER/ADMIN only)' })
  async approveSubscriptionRequest(
    @Param('companyId') companyId: string,
    @Param('requestId') requestId: string,
    @CurrentUser('id') userId: string,
  ) {
    return ApiResponse.success(
      await this.approvalService.approveSubscriptionRequest(companyId, requestId, userId),
      'Subscription request approved',
    );
  }

  @Post('subscription-requests/:requestId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a subscription request (OWNER/ADMIN only)' })
  async rejectSubscriptionRequest(
    @Param('companyId') companyId: string,
    @Param('requestId') requestId: string,
    @Body() dto: RejectMemberDto,
    @CurrentUser('id') userId: string,
  ) {
    return ApiResponse.success(
      await this.approvalService.rejectSubscriptionRequest(companyId, requestId, userId, dto.reason),
      'Subscription request rejected',
    );
  }
}
