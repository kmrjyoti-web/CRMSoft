import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { ConnectCloudCommand } from '../application/commands/connect-cloud/connect-cloud.command';
import { DisconnectCloudCommand } from '../application/commands/disconnect-cloud/disconnect-cloud.command';
import { GetCloudConnectionsQuery } from '../application/queries/get-cloud-connections/get-cloud-connections.query';
import { ConnectCloudDto } from './dto/cloud.dto';
import { StorageProvider } from '@prisma/working-client';

@ApiTags('Cloud Connections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cloud-connections')
export class CloudController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermissions('documents:create')
  async connect(@Body() dto: ConnectCloudDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new ConnectCloudCommand(
        userId, dto.provider, dto.accessToken, dto.refreshToken,
        dto.tokenExpiry ? new Date(dto.tokenExpiry) : undefined,
        dto.accountEmail, dto.accountName,
      ),
    );
    return ApiResponse.success(result, 'Cloud provider connected successfully');
  }

  @Get()
  @RequirePermissions('documents:read')
  async list(@CurrentUser('id') userId: string) {
    const result = await this.queryBus.execute(new GetCloudConnectionsQuery(userId));
    return ApiResponse.success(result);
  }

  @Delete(':provider')
  @RequirePermissions('documents:delete')
  async disconnect(@Param('provider') provider: StorageProvider, @CurrentUser('id') userId: string) {
    await this.commandBus.execute(new DisconnectCloudCommand(userId, provider));
    return ApiResponse.success(null, 'Cloud provider disconnected successfully');
  }
}
