import {
  Controller, Get, Post, Delete, Param, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/utils/api-response';
import { CompanyInviteService } from './company-invite.service';

class CreateInviteDto {
  @ApiPropertyOptional({ example: 'partner@example.com' })
  @IsOptional() @IsEmail() inviteeEmail?: string;

  @ApiPropertyOptional({ example: 'MEMBER', description: 'Role to assign on accept' })
  @IsOptional() @IsString() role?: string;

  @ApiPropertyOptional({ example: 'Looking forward to working with you!' })
  @IsOptional() @IsString() personalMessage?: string;

  @ApiPropertyOptional({ example: 'EMAIL', enum: ['EMAIL', 'WHATSAPP', 'LINK'] })
  @IsOptional() @IsString() sentVia?: string;
}

// ── Auth-required invite endpoints ───────────────────────────────────────────

@ApiTags('Company Invites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/invites')
export class CompanyInviteController {
  constructor(private readonly inviteService: CompanyInviteService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create invite link for company (OWNER/ADMIN only)' })
  async create(
    @Param('companyId') companyId: string,
    @Body() dto: CreateInviteDto,
    @CurrentUser('id') userId: string,
  ) {
    return ApiResponse.success(
      await this.inviteService.createInvite({
        companyId,
        invitedByUserId: userId,
        ...dto,
      }),
      'Invite created',
    );
  }

  @Get()
  @ApiOperation({ summary: 'List invites for a company' })
  @ApiQuery({ name: 'status', required: false, example: 'PENDING' })
  async list(
    @Param('companyId') companyId: string,
    @Query('status') status?: string,
  ) {
    return ApiResponse.success(await this.inviteService.listInvites(companyId, status));
  }

  @Delete(':inviteId')
  @ApiOperation({ summary: 'Revoke an invite (OWNER/ADMIN only)' })
  async revoke(
    @Param('companyId') companyId: string,
    @Param('inviteId') inviteId: string,
    @CurrentUser('id') userId: string,
  ) {
    return ApiResponse.success(
      await this.inviteService.revokeInvite(inviteId, userId),
      'Invite revoked',
    );
  }

  @Post(':inviteId/resend')
  @ApiOperation({ summary: 'Resend an invite (extends expiry by 7 days)' })
  async resend(
    @Param('companyId') companyId: string,
    @Param('inviteId') inviteId: string,
    @CurrentUser('id') userId: string,
  ) {
    return ApiResponse.success(
      await this.inviteService.resendInvite(inviteId, userId),
      'Invite resent',
    );
  }
}

// ── Public invite endpoints ───────────────────────────────────────────────────

@ApiTags('Public - Invites')
@Public()
@Controller('public/invite')
export class PublicInviteController {
  constructor(private readonly inviteService: CompanyInviteService) {}

  @Get(':token')
  @ApiOperation({ summary: 'Get invite details by token (no auth — for invite preview page)' })
  async getInvite(@Param('token') token: string) {
    return ApiResponse.success(await this.inviteService.getInviteByToken(token));
  }

  @Post(':token/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept invite (requires auth — if not logged in, frontend redirects to register with ?invite=token)' })
  async acceptInvite(
    @Param('token') token: string,
    @CurrentUser('id') userId: string,
  ) {
    return ApiResponse.success(
      await this.inviteService.acceptInvite(token, userId),
      'Invite accepted — you have joined the company',
    );
  }
}
