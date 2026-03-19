import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@Injectable()
export class RollbackEngineService {
  constructor(private readonly prisma: PrismaService) {}

  async listBackups(filters: {
    versionId?: string;
    backupType?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(filters.page || 1, 1);
    const limit = Math.min(Math.max(filters.limit || 20, 1), 100);
    const where: any = {};

    if (filters.versionId) where.versionId = filters.versionId;
    if (filters.backupType) where.backupType = filters.backupType;
    if (filters.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      (this.prisma as any).versionBackup.findMany({
        where,
        include: { version: { select: { id: true, version: true, codeName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      (this.prisma as any).versionBackup.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async createBackup(data: {
    versionId: string;
    backupType?: string;
    dbDumpPath?: string;
    configSnapshot?: any;
    schemaSnapshot?: string;
  }) {
    const version = await (this.prisma as any).appVersion.findUnique({ where: { id: data.versionId } });
    if (!version) throw new NotFoundException('Version not found');

    return (this.prisma as any).versionBackup.create({
      data: {
        versionId: data.versionId,
        backupType: data.backupType ?? 'MANUAL',
        dbDumpPath: data.dbDumpPath,
        configSnapshot: data.configSnapshot ?? {},
        schemaSnapshot: data.schemaSnapshot,
        status: 'COMPLETED',
      },
    });
  }

  async restoreBackup(id: string, restoredBy: string) {
    const backup = await (this.prisma as any).versionBackup.findUnique({
      where: { id },
      include: { version: true },
    });
    if (!backup) throw new NotFoundException('Backup not found');
    if (backup.status !== 'COMPLETED') {
      throw new BadRequestException('Only completed backups can be restored');
    }

    // Mark as restoring
    await (this.prisma as any).versionBackup.update({
      where: { id },
      data: { status: 'RESTORING' },
    });

    try {
      // Mark backup as restored
      const restored = await (this.prisma as any).versionBackup.update({
        where: { id },
        data: {
          status: 'RESTORED',
          restoredAt: new Date(),
          restoredBy,
        },
      });

      // Rollback the associated version
      await (this.prisma as any).appVersion.update({
        where: { id: backup.versionId },
        data: {
          status: 'ROLLED_BACK' as any,
          rollbackAt: new Date(),
          rollbackReason: `Restored from backup ${id}`,
        },
      });

      return restored;
    } catch (error: any) {
      await (this.prisma as any).versionBackup.update({
        where: { id },
        data: { status: 'FAILED' },
      });
      throw new BadRequestException(`Restore failed: ${error.message}`);
    }
  }

  async deleteBackup(id: string) {
    const backup = await (this.prisma as any).versionBackup.findUnique({ where: { id } });
    if (!backup) throw new NotFoundException('Backup not found');
    return (this.prisma as any).versionBackup.delete({ where: { id } });
  }
}
