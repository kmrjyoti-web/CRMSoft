import {
  Controller, Get, Post, Param, Body, UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { ConnectAccountCommand } from '../application/commands/connect-account/connect-account.command';
import { DisconnectAccountCommand } from '../application/commands/disconnect-account/disconnect-account.command';
import { SyncInboxCommand } from '../application/commands/sync-inbox/sync-inbox.command';
import { GetAccountsQuery } from '../application/queries/get-accounts/query';
import { GetAccountDetailQuery } from '../application/queries/get-account-detail/query';
import { ConnectAccountDto } from './dto/email-account.dto';

@ApiTags('Email Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('email-accounts')
export class EmailAccountController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('connect')
  @RequirePermissions('emails:create')
  async connect(@Body() dto: ConnectAccountDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new ConnectAccountCommand(
        dto.provider, userId, dto.emailAddress, dto.displayName, dto.label,
        dto.accessToken, dto.refreshToken, undefined,
        dto.imapHost, dto.imapPort, dto.imapSecure,
        dto.smtpHost, dto.smtpPort, dto.smtpSecure,
        dto.smtpUsername, dto.smtpPassword,
      ),
    );
    return ApiResponse.success(result, 'Email account connected');
  }

  @Post(':id/disconnect')
  @RequirePermissions('emails:delete')
  async disconnect(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new DisconnectAccountCommand(id, userId));
    return ApiResponse.success(result, 'Email account disconnected');
  }

  @Post(':id/sync')
  @RequirePermissions('emails:update')
  async sync(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new SyncInboxCommand(id, userId));
    return ApiResponse.success(result, 'Inbox sync started');
  }

  @Get()
  @RequirePermissions('emails:read')
  async list(@CurrentUser('id') userId: string) {
    const result = await this.queryBus.execute(new GetAccountsQuery(userId));
    return ApiResponse.success(result, 'Email accounts retrieved');
  }

  @Get(':id')
  @RequirePermissions('emails:read')
  async getById(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetAccountDetailQuery(id));
    return ApiResponse.success(result, 'Email account retrieved');
  }
}
