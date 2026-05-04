import {
  Controller, Get, Post, Delete, Body, Param, Query,
  UseGuards, Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { SyncEngineService } from '../services/sync-engine.service';
import { PullService } from '../services/pull.service';
import { PushService } from '../services/push.service';
import { ConflictResolverService } from '../services/conflict-resolver.service';
import { FlushService } from '../services/flush.service';
import { PullEntityDto } from './dto/pull-entity.dto';
import { PushChangesDto } from './dto/push-changes.dto';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { HeartbeatDto } from './dto/heartbeat.dto';
import { ResolveConflictDto } from './dto/resolve-conflict.dto';

@ApiTags('Sync')
@ApiBearerAuth()
@Controller('sync')
@UseGuards(AuthGuard('jwt'))
export class SyncController {
  constructor(
    private readonly syncEngine: SyncEngineService,
    private readonly pullService: PullService,
    private readonly pushService: PushService,
    private readonly conflictResolver: ConflictResolverService,
    private readonly flushService: FlushService,
  ) {}

  @Get('config')
  @ApiOperation({ summary: 'Fetch sync policies, warning rules, and global settings' })
  async getConfig(@CurrentUser('id') userId: string) {
    const config = await this.syncEngine.getConfig(userId);
    return ApiResponse.success(config, 'Sync config retrieved');
  }

  @Get('status')
  @ApiOperation({ summary: 'Get sync status: warnings, enforcement, flush commands' })
  async getStatus(
    @CurrentUser('id') userId: string,
    @Query('deviceId') deviceId: string,
  ) {
    const status = await this.syncEngine.getSyncStatus(userId, deviceId);
    return ApiResponse.success(status, 'Sync status retrieved');
  }

  @Post('pull/:entityName')
  @ApiOperation({ summary: 'Delta download — get records changed since lastPulledAt' })
  async pullEntity(
    @Param('entityName') entityName: string,
    @Body() dto: PullEntityDto,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.pullService.pull({
      entityName,
      userId,
      deviceId: dto.deviceId,
      lastPulledAt: dto.lastPulledAt ? new Date(dto.lastPulledAt) : null,
      cursor: dto.cursor,
      limit: dto.limit,
    });
    return ApiResponse.success(result, `Pulled ${result.downloadedCount} ${entityName} records`);
  }

  @Post('pull/full')
  @ApiOperation({ summary: 'Full initial sync — download all enabled entities' })
  async fullSync(
    @Body() body: { deviceId: string },
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.pullService.fullSync(userId, body.deviceId);
    return ApiResponse.success(result, `Full sync complete: ${result.totalRecords} records`);
  }

  @Post('push')
  @ApiOperation({ summary: 'Upload offline changes (batch)' })
  async push(
    @Body() dto: PushChangesDto,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.pushService.push({
      userId,
      deviceId: dto.deviceId,
      changes: dto.changes as any,
    });
    return ApiResponse.success(result, `Pushed ${result.totalProcessed} changes`);
  }

  @Post('heartbeat')
  @ApiOperation({ summary: 'Report device status to server' })
  async heartbeat(
    @Body() dto: HeartbeatDto,
    @CurrentUser('id') userId: string,
    @Req() req: Request,
  ) {
    await this.syncEngine.heartbeat(userId, dto.deviceId, {
      pendingUploadCount: dto.pendingUploadCount,
      storageUsedMb: dto.storageUsedMb,
      recordCounts: dto.recordCounts,
      entitySyncState: dto.entitySyncState,
    }, req.ip);
    return ApiResponse.success(null, 'Heartbeat recorded');
  }

  @Post('device/register')
  @ApiOperation({ summary: 'Register a device for sync' })
  async registerDevice(
    @Body() dto: RegisterDeviceDto,
    @CurrentUser('id') userId: string,
  ) {
    const device = await this.syncEngine.registerDevice(userId, dto);
    return ApiResponse.success(device, 'Device registered');
  }

  @Delete('device/:deviceId')
  @ApiOperation({ summary: 'Remove a device from sync' })
  async removeDevice(
    @Param('deviceId') deviceId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.syncEngine.removeDevice(userId, deviceId);
    return ApiResponse.success(null, 'Device removed');
  }

  @Post('flush/:flushId/acknowledge')
  @ApiOperation({ summary: 'Confirm flush executed on device' })
  async acknowledgeFlush(
    @Param('flushId') flushId: string,
    @Body() body: { deviceId: string },
  ) {
    await this.flushService.acknowledgeFlush(flushId, body.deviceId);
    return ApiResponse.success(null, 'Flush acknowledged');
  }

  // ── CONFLICTS ──

  @Get('conflicts')
  @ApiOperation({ summary: 'List pending conflicts for current user' })
  async listConflicts(@CurrentUser('id') userId: string) {
    const conflicts = await this.conflictResolver.getPendingConflicts(userId);
    return ApiResponse.success(conflicts, 'Conflicts retrieved');
  }

  @Get('conflicts/:id')
  @ApiOperation({ summary: 'Get conflict detail (side-by-side)' })
  async getConflict(@Param('id') id: string) {
    const conflict = await this.conflictResolver.getConflictDetail(id);
    return ApiResponse.success(conflict, 'Conflict detail retrieved');
  }

  @Post('conflicts/:id/resolve')
  @ApiOperation({ summary: 'Manually resolve a conflict' })
  async resolveConflict(
    @Param('id') id: string,
    @Body() dto: ResolveConflictDto,
    @CurrentUser('id') userId: string,
  ) {
    await this.conflictResolver.manualResolve(id, {
      resolvedData: dto.resolvedData,
      userId,
    });
    return ApiResponse.success(null, 'Conflict resolved');
  }
}
