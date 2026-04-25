import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateShareLinkCommand } from '../application/commands/create-share-link/create-share-link.command';
import { RevokeShareLinkCommand } from '../application/commands/revoke-share-link/revoke-share-link.command';
import { GetShareLinkQuery } from '../application/queries/get-share-link/get-share-link.query';
import { CreateShareLinkDto, AccessShareLinkDto } from './dto/share-link.dto';
import { ShareLinkService } from '../services/share-link.service';

@ApiTags('Document Share Links')
@Controller('document-shares')
export class ShareLinkController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly shareLinkService: ShareLinkService,
  ) {}

  @Post(':documentId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions('documents:create')
  async create(
    @Param('documentId') documentId: string,
    @Body() dto: CreateShareLinkDto,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.commandBus.execute(
      new CreateShareLinkCommand(
        documentId, userId, dto.access, dto.password,
        dto.expiresAt ? new Date(dto.expiresAt) : undefined, dto.maxViews,
      ),
    );
    return ApiResponse.success(result, 'Share link created successfully');
  }

  // Public endpoint — no auth required
  @Get('access/:token')
  async accessLink(@Param('token') token: string, @Query('password') password?: string) {
    const result = await this.queryBus.execute(new GetShareLinkQuery(token, password));
    return ApiResponse.success(result);
  }

  @Get(':documentId/links')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions('documents:read')
  async getDocumentLinks(@Param('documentId') documentId: string) {
    const result = await this.shareLinkService.getDocumentLinks(documentId);
    return ApiResponse.success(result);
  }

  @Delete(':linkId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions('documents:delete')
  async revokeLink(@Param('linkId') linkId: string, @CurrentUser('id') userId: string) {
    await this.commandBus.execute(new RevokeShareLinkCommand(linkId, userId));
    return ApiResponse.success(null, 'Share link revoked successfully');
  }
}
