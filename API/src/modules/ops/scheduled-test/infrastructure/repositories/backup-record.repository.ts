import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';

export const BACKUP_RECORD_REPOSITORY = Symbol('BACKUP_RECORD_REPOSITORY');

export interface IBackupRecordRepository {
  create(data: CreateBackupRecordData): Promise<any>;
  findById(id: string): Promise<any | null>;
  findByTenantId(tenantId: string, limit?: number): Promise<any[]>;
  findLatestValidated(tenantId: string): Promise<any | null>;
  update(id: string, data: UpdateBackupRecordData): Promise<any>;
}

export interface CreateBackupRecordData {
  tenantId: string;
  dbName: string;
  backupUrl: string;
  checksum: string;
  sizeBytes: bigint;
  tableCount?: number;
  rowCount?: bigint;
  expiresAt?: Date;
  createdById?: string;
}

export interface UpdateBackupRecordData {
  isValidated?: boolean;
  validatedAt?: Date;
  tableCount?: number;
  rowCount?: bigint;
}

@Injectable()
export class PrismaBackupRecordRepository implements IBackupRecordRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateBackupRecordData) {
    return this.prisma.platform.databaseBackupRecord.create({ data: data as any });
  }

  async findById(id: string) {
    return this.prisma.platform.databaseBackupRecord.findUnique({ where: { id } });
  }

  async findByTenantId(tenantId: string, limit = 20) {
    return this.prisma.platform.databaseBackupRecord.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /** Find the latest validated backup not yet expired */
  async findLatestValidated(tenantId: string): Promise<any | null> {
    return this.prisma.platform.databaseBackupRecord.findFirst({
      where: {
        tenantId,
        isValidated: true,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: UpdateBackupRecordData) {
    return this.prisma.platform.databaseBackupRecord.update({
      where: { id },
      data: data as any,
    });
  }
}
