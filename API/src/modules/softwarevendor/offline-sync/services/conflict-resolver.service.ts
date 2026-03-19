import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ConflictStrategy, Prisma } from '@prisma/working-client';
import { EntityResolverService } from './entity-resolver.service';

export interface ConflictResolveParams {
  entityName: string;
  entityId: string;
  clientData: Record<string, any>;
  serverData: Record<string, any>;
  baseData?: Record<string, any>;
  clientTimestamp: Date;
  serverTimestamp: Date;
  strategy: ConflictStrategy;
  userId: string;
  deviceId: string;
  entityLabel?: string;
}

export interface ConflictResolution {
  resolved: boolean;
  strategy: string;
  finalData: Record<string, any> | null;
  conflictId: string;
  conflictingFields: FieldConflict[];
  autoMergedFields: MergedField[];
}

export interface FieldConflict {
  field: string;
  clientValue: any;
  serverValue: any;
  baseValue?: any;
}

export interface MergedField {
  field: string;
  value: any;
  source: 'CLIENT' | 'SERVER';
}

@Injectable()
export class ConflictResolverService {
  private readonly logger = new Logger(ConflictResolverService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly entityResolver: EntityResolverService,
  ) {}

  async resolve(params: ConflictResolveParams): Promise<ConflictResolution> {
    const {
      entityName, entityId, clientData, serverData, baseData,
      clientTimestamp, serverTimestamp, strategy, userId, deviceId, entityLabel,
    } = params;

    // Detect conflicting fields
    const { conflicts, clientOnly, serverOnly } = this.detectFieldConflicts(
      clientData, serverData, baseData,
    );

    let resolved = false;
    let finalData: Record<string, any> | null = null;
    let autoMergedFields: MergedField[] = [];
    let statusToSet: any = 'PENDING';
    let resolvedStrategy = strategy;

    switch (strategy) {
      case 'SERVER_WINS':
        finalData = serverData;
        resolved = true;
        statusToSet = 'SERVER_APPLIED';
        break;

      case 'CLIENT_WINS':
        finalData = { ...serverData, ...clientData };
        resolved = true;
        statusToSet = 'CLIENT_APPLIED';
        // Apply client data to DB
        await this.applyToDatabase(entityName, entityId, clientData);
        break;

      case 'LATEST_WINS':
        if (clientTimestamp > serverTimestamp) {
          finalData = { ...serverData, ...clientData };
          statusToSet = 'CLIENT_APPLIED';
          await this.applyToDatabase(entityName, entityId, clientData);
        } else {
          finalData = serverData;
          statusToSet = 'SERVER_APPLIED';
        }
        resolved = true;
        break;

      case 'MERGE_FIELDS':
        const merged = this.mergeFields(clientData, serverData, baseData, conflicts, clientOnly, serverOnly);
        finalData = merged.mergedData;
        autoMergedFields = merged.autoMerged;
        if (conflicts.length === 0) {
          // All fields resolved via auto-merge
          resolved = true;
          statusToSet = 'AUTO_RESOLVED';
          await this.applyToDatabase(entityName, entityId, finalData);
        } else {
          // Some fields still in conflict → manual resolution needed
          resolved = false;
          statusToSet = 'PENDING';
        }
        break;

      case 'MANUAL':
      default:
        resolved = false;
        statusToSet = 'PENDING';
        break;
    }

    // Create conflict record (even for auto-resolved, for audit)
    const conflict = await this.prisma.working.syncConflict.create({
      data: {
        deviceId,
        userId,
        entityName,
        entityId,
        entityLabel,
        clientData,
        serverData,
        baseData,
        clientModifiedAt: clientTimestamp,
        serverModifiedAt: serverTimestamp,
        conflictingFields: conflicts as unknown as Prisma.InputJsonValue,
        nonConflictingMerge: autoMergedFields.length > 0 ? (autoMergedFields as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        status: statusToSet,
        resolvedBy: resolved ? 'SYSTEM_AUTO' : undefined,
        resolvedStrategy: resolved ? resolvedStrategy : undefined,
        resolvedData: finalData === null ? Prisma.JsonNull : (finalData as Prisma.InputJsonValue),
        resolvedAt: resolved ? new Date() : undefined,
      },
    });

    return {
      resolved,
      strategy: resolvedStrategy,
      finalData,
      conflictId: conflict.id,
      conflictingFields: conflicts,
      autoMergedFields,
    };
  }

  async manualResolve(
    conflictId: string,
    resolution: { resolvedData: Record<string, any>; userId: string },
  ): Promise<void> {
    const conflict = await this.prisma.working.syncConflict.findUnique({
      where: { id: conflictId },
    });
    if (!conflict) {
      throw new NotFoundException(`Conflict "${conflictId}" not found`);
    }
    if (conflict.status !== 'PENDING') {
      throw new NotFoundException(`Conflict "${conflictId}" is already resolved`);
    }

    // Apply resolved data to the database
    await this.applyToDatabase(
      conflict.entityName,
      conflict.entityId,
      resolution.resolvedData,
    );

    // Update conflict record
    await this.prisma.working.syncConflict.update({
      where: { id: conflictId },
      data: {
        status: 'MANUALLY_RESOLVED',
        resolvedBy: resolution.userId,
        resolvedStrategy: 'MANUAL',
        resolvedData: resolution.resolvedData,
        resolvedAt: new Date(),
      },
    });
  }

  async getPendingConflicts(userId: string): Promise<any[]> {
    return this.prisma.working.syncConflict.findMany({
      where: { userId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getConflictDetail(conflictId: string): Promise<any> {
    const conflict = await this.prisma.working.syncConflict.findUnique({
      where: { id: conflictId },
    });
    if (!conflict) throw new NotFoundException(`Conflict "${conflictId}" not found`);
    return conflict;
  }

  private detectFieldConflicts(
    clientData: Record<string, any>,
    serverData: Record<string, any>,
    baseData?: Record<string, any>,
  ): {
    conflicts: FieldConflict[];
    clientOnly: MergedField[];
    serverOnly: MergedField[];
  } {
    const conflicts: FieldConflict[] = [];
    const clientOnly: MergedField[] = [];
    const serverOnly: MergedField[] = [];

    const skipFields = new Set(['id', 'tenantId', 'createdAt', 'updatedAt', 'createdById']);
    const allFields = new Set([...Object.keys(clientData), ...Object.keys(serverData)]);

    for (const field of allFields) {
      if (skipFields.has(field)) continue;

      const cv = clientData[field];
      const sv = serverData[field];
      const bv = baseData?.[field];

      if (JSON.stringify(cv) === JSON.stringify(sv)) continue;

      if (baseData) {
        const clientChanged = JSON.stringify(cv) !== JSON.stringify(bv);
        const serverChanged = JSON.stringify(sv) !== JSON.stringify(bv);

        if (clientChanged && serverChanged) {
          // True conflict — both sides changed
          conflicts.push({ field, clientValue: cv, serverValue: sv, baseValue: bv });
        } else if (clientChanged && !serverChanged) {
          clientOnly.push({ field, value: cv, source: 'CLIENT' });
        } else if (!clientChanged && serverChanged) {
          serverOnly.push({ field, value: sv, source: 'SERVER' });
        }
      } else {
        // No base data — can't do 3-way merge, treat as conflict
        conflicts.push({ field, clientValue: cv, serverValue: sv });
      }
    }

    return { conflicts, clientOnly, serverOnly };
  }

  private mergeFields(
    clientData: Record<string, any>,
    serverData: Record<string, any>,
    baseData: Record<string, any> | undefined,
    conflicts: FieldConflict[],
    clientOnly: MergedField[],
    serverOnly: MergedField[],
  ): { mergedData: Record<string, any>; autoMerged: MergedField[] } {
    // Start with server data as base
    const mergedData = { ...serverData };
    const autoMerged: MergedField[] = [];

    // Apply non-conflicting client changes
    for (const change of clientOnly) {
      mergedData[change.field] = change.value;
      autoMerged.push(change);
    }

    // Server-only changes are already in mergedData
    for (const change of serverOnly) {
      autoMerged.push(change);
    }

    return { mergedData, autoMerged };
  }

  private async applyToDatabase(
    entityName: string,
    entityId: string,
    data: Record<string, any>,
  ): Promise<void> {
    const delegate = this.entityResolver.getDelegate(entityName);
    // Strip non-updatable fields
    const { id, tenantId, createdAt, createdById, createdByUser, ...updateData } = data;
    try {
      await delegate.update({
        where: { id: entityId },
        data: updateData,
      });
    } catch (err: any) {
      this.logger.error(`Failed to apply conflict resolution to ${entityName}/${entityId}: ${err.message}`);
      throw err;
    }
  }
}
