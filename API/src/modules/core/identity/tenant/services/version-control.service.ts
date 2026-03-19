import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@Injectable()
export class VersionControlService {
  constructor(private readonly prisma: PrismaService) {}

  async listVersions(filters: {
    status?: string;
    releaseType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(filters.page || 1, 1);
    const limit = Math.min(Math.max(filters.limit || 20, 1), 100);
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.releaseType) where.releaseType = filters.releaseType;
    if (filters.search) {
      where.OR = [
        { version: { contains: filters.search, mode: 'insensitive' } },
        { codeName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      (this.prisma as any).appVersion.findMany({
        where,
        include: { _count: { select: { patches: true, tenantVersions: true, backups: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      (this.prisma as any).appVersion.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getById(id: string) {
    const version = await (this.prisma as any).appVersion.findUnique({
      where: { id },
      include: {
        patches: { orderBy: { createdAt: 'desc' } },
        tenantVersions: { orderBy: { createdAt: 'desc' }, take: 20 },
        backups: { orderBy: { createdAt: 'desc' } },
        _count: { select: { patches: true, tenantVersions: true, backups: true } },
      },
    });
    if (!version) throw new NotFoundException('Version not found');
    return version;
  }

  async create(data: {
    version: string;
    codeName?: string;
    releaseType?: string;
    changelog?: any[];
    breakingChanges?: any[];
    migrationNotes?: string;
    modulesUpdated?: string[];
    schemaChanges?: any;
    gitBranch?: string;
  }) {
    // Validate semver format
    if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(data.version)) {
      throw new BadRequestException('Version must follow semantic versioning (e.g., 1.2.3)');
    }

    const existing = await (this.prisma as any).appVersion.findUnique({ where: { version: data.version } });
    if (existing) throw new BadRequestException(`Version ${data.version} already exists`);

    return (this.prisma as any).appVersion.create({
      data: {
        version: data.version,
        codeName: data.codeName,
        releaseType: data.releaseType ?? 'MINOR',
        changelog: data.changelog ?? [],
        breakingChanges: data.breakingChanges ?? [],
        migrationNotes: data.migrationNotes,
        modulesUpdated: data.modulesUpdated ?? [],
        schemaChanges: data.schemaChanges,
        gitBranch: data.gitBranch,
      },
    });
  }

  async update(id: string, data: {
    codeName?: string;
    releaseType?: string;
    changelog?: any[];
    breakingChanges?: any[];
    migrationNotes?: string;
    modulesUpdated?: string[];
    schemaChanges?: any;
    gitBranch?: string;
    status?: string;
  }) {
    await this.getById(id);
    return (this.prisma as any).appVersion.update({ where: { id }, data: data as any });
  }

  async publish(id: string, deployedBy: string) {
    const version = await this.getById(id);
    if ((version as any).status === 'PUBLISHED') {
      throw new BadRequestException('Version is already published');
    }

    // Create backup before publishing
    await (this.prisma as any).versionBackup.create({
      data: {
        versionId: id,
        backupType: 'PRE_DEPLOY',
        configSnapshot: {},
        status: 'COMPLETED',
      },
    });

    return (this.prisma as any).appVersion.update({
      where: { id },
      data: {
        status: 'PUBLISHED' as any,
        deployedAt: new Date(),
        deployedBy,
        gitTag: `v${(version as any).version}`,
      },
    });
  }

  async rollback(id: string, reason: string, rolledBackBy: string) {
    const version = await this.getById(id);
    if ((version as any).status !== 'PUBLISHED') {
      throw new BadRequestException('Only published versions can be rolled back');
    }

    return (this.prisma as any).appVersion.update({
      where: { id },
      data: {
        status: 'ROLLED_BACK' as any,
        rollbackAt: new Date(),
        rollbackReason: reason,
      },
    });
  }

  async checkForceUpdate(tenantId: string) {
    const pending = await (this.prisma as any).tenantVersion.findFirst({
      where: {
        tenantId,
        forceUpdatePending: true,
      } as any,
      orderBy: { createdAt: 'desc' },
    });

    if (!pending) {
      return { pending: false, message: '', deadline: null };
    }

    return {
      pending: true,
      message: (pending as any).forceUpdateMessage || 'A system update is required',
      deadline: (pending as any).forceUpdateDeadline,
    };
  }

  async getStats() {
    const [total, byStatus, byReleaseType, recentDeployments] = await Promise.all([
      (this.prisma as any).appVersion.count(),
      (this.prisma as any).appVersion.groupBy({ by: ['status'], _count: true }),
      (this.prisma as any).appVersion.groupBy({ by: ['releaseType'], _count: true }),
      (this.prisma as any).appVersion.findMany({
        where: { status: 'PUBLISHED' as any },
        orderBy: { deployedAt: 'desc' },
        take: 5,
        select: { id: true, version: true, codeName: true, deployedAt: true },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.map((g: { status: unknown; _count: unknown }) => ({ status: g.status, count: g._count })),
      byReleaseType: byReleaseType.map((g: { releaseType: unknown; _count: unknown }) => ({ releaseType: g.releaseType, count: g._count })),
      recentDeployments,
    };
  }
}
