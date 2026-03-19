import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/working-client';
import { PrismaService } from '../../../../core/prisma/prisma.service';

export interface IssueFlushParams {
  flushType: 'FULL' | 'ENTITY' | 'DEVICE';
  targetUserId?: string;
  targetDeviceId?: string;
  targetEntity?: string;
  reason: string;
  redownloadAfter?: boolean;
  issuedById: string;
  issuedByName: string;
}

@Injectable()
export class FlushService {
  private readonly logger = new Logger(FlushService.name);

  constructor(private readonly prisma: PrismaService) {}

  async issueFlush(params: IssueFlushParams): Promise<any> {
    const {
      flushType, targetUserId, targetDeviceId, targetEntity,
      reason, redownloadAfter = true, issuedById, issuedByName,
    } = params;

    // Validate params based on flush type
    if (flushType === 'ENTITY' && !targetEntity) {
      throw new BadRequestException('targetEntity required for ENTITY flush');
    }
    if (flushType === 'DEVICE' && !targetDeviceId) {
      throw new BadRequestException('targetDeviceId required for DEVICE flush');
    }

    const command = await this.prisma.syncFlushCommand.create({
      data: {
        flushType: flushType as any,
        targetUserId,
        targetDeviceId,
        targetEntity,
        reason,
        redownloadAfter,
        status: 'PENDING',
        issuedById,
        issuedByName,
      },
    });

    // Update targeted devices with pending flush
    if (targetDeviceId) {
      await this.prisma.syncDevice.updateMany({
        where: { deviceId: targetDeviceId },
        data: { pendingFlushId: command.id, status: 'FLUSH_PENDING' },
      });
    } else if (targetUserId) {
      await this.prisma.syncDevice.updateMany({
        where: { userId: targetUserId, status: 'ACTIVE' },
        data: { pendingFlushId: command.id, status: 'FLUSH_PENDING' },
      });
    }

    this.logger.log(`Flush command issued: ${flushType} by ${issuedByName} - ${reason}`);
    return command;
  }

  async acknowledgeFlush(flushId: string, deviceId: string): Promise<void> {
    const command = await this.prisma.syncFlushCommand.findUnique({
      where: { id: flushId },
    });
    if (!command) throw new NotFoundException(`Flush command "${flushId}" not found`);
    if (command.status !== 'PENDING') {
      throw new BadRequestException(`Flush "${flushId}" is not in PENDING state`);
    }

    await this.prisma.syncFlushCommand.update({
      where: { id: flushId },
      data: { status: 'ACKNOWLEDGED', acknowledgedAt: new Date() },
    });

    // Update device
    const device = await this.prisma.syncDevice.findFirst({
      where: { deviceId },
    });
    if (device) {
      await this.prisma.syncDevice.update({
        where: { id: device.id },
        data: { pendingFlushId: null, status: 'ACTIVE' },
      });
    }

    // Log audit
    await this.prisma.syncAuditLog.create({
      data: {
        userId: command.targetUserId || '',
        deviceId,
        action: 'FLUSH',
        details: { flushId, flushType: command.flushType, acknowledged: true },
      },
    });
  }

  async executeFlush(flushId: string, deviceId: string): Promise<void> {
    const command = await this.prisma.syncFlushCommand.findUnique({
      where: { id: flushId },
    });
    if (!command) throw new NotFoundException(`Flush command "${flushId}" not found`);

    await this.prisma.syncFlushCommand.update({
      where: { id: flushId },
      data: { status: 'EXECUTED', executedAt: new Date() },
    });

    // Reset device entity sync state after flush
    const device = await this.prisma.syncDevice.findFirst({
      where: { deviceId },
    });
    if (device) {
      const entitySyncState = command.targetEntity
        ? this.clearEntityFromState(device.entitySyncState as Record<string, any>, command.targetEntity)
        : {};

      await this.prisma.syncDevice.update({
        where: { id: device.id },
        data: {
          pendingFlushId: null,
          status: 'ACTIVE',
          entitySyncState: command.flushType === 'FULL' ? {} : entitySyncState,
          recordCounts: command.flushType === 'FULL' ? {} : (device.recordCounts ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          storageUsedMb: command.flushType === 'FULL' ? 0 : device.storageUsedMb,
        },
      });
    }
  }

  async cancelFlush(flushId: string): Promise<void> {
    const command = await this.prisma.syncFlushCommand.findUnique({
      where: { id: flushId },
    });
    if (!command) throw new NotFoundException(`Flush command "${flushId}" not found`);
    if (command.status !== 'PENDING') {
      throw new BadRequestException(`Cannot cancel flush in "${command.status}" state`);
    }

    await this.prisma.syncFlushCommand.update({
      where: { id: flushId },
      data: { status: 'FAILED' },
    });

    // Clear pending flush from affected devices
    await this.prisma.syncDevice.updateMany({
      where: { pendingFlushId: flushId },
      data: { pendingFlushId: null, status: 'ACTIVE' },
    });
  }

  async getFlushCommands(filters: {
    targetUserId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: any[]; total: number }> {
    const where: Record<string, any> = {};
    if (filters.targetUserId) where.targetUserId = filters.targetUserId;
    if (filters.status) where.status = filters.status;

    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const [data, total] = await Promise.all([
      this.prisma.syncFlushCommand.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.syncFlushCommand.count({ where }),
    ]);

    return { data, total };
  }

  private clearEntityFromState(
    state: Record<string, any> | null,
    entityName: string,
  ): Record<string, any> {
    if (!state) return {};
    const updated = { ...state };
    delete updated[entityName];
    return updated;
  }
}
