import { Request } from 'express';
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
export declare class SyncController {
    private readonly syncEngine;
    private readonly pullService;
    private readonly pushService;
    private readonly conflictResolver;
    private readonly flushService;
    constructor(syncEngine: SyncEngineService, pullService: PullService, pushService: PushService, conflictResolver: ConflictResolverService, flushService: FlushService);
    getConfig(userId: string): Promise<ApiResponse<import("../services/sync-engine.service").SyncConfig>>;
    getStatus(userId: string, deviceId: string): Promise<ApiResponse<import("../services/sync-engine.service").SyncStatus>>;
    pullEntity(entityName: string, dto: PullEntityDto, userId: string): Promise<ApiResponse<import("../services/pull.service").PullResult>>;
    fullSync(body: {
        deviceId: string;
    }, userId: string): Promise<ApiResponse<import("../services/pull.service").FullSyncResult>>;
    push(dto: PushChangesDto, userId: string): Promise<ApiResponse<import("../services/push.service").PushResult>>;
    heartbeat(dto: HeartbeatDto, userId: string, req: Request): Promise<ApiResponse<null>>;
    registerDevice(dto: RegisterDeviceDto, userId: string): Promise<ApiResponse<Record<string, unknown>>>;
    removeDevice(deviceId: string, userId: string): Promise<ApiResponse<null>>;
    acknowledgeFlush(flushId: string, body: {
        deviceId: string;
    }): Promise<ApiResponse<null>>;
    listConflicts(userId: string): Promise<ApiResponse<any[]>>;
    getConflict(id: string): Promise<ApiResponse<Record<string, unknown>>>;
    resolveConflict(id: string, dto: ResolveConflictDto, userId: string): Promise<ApiResponse<null>>;
}
