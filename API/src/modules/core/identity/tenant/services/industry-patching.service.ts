import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@Injectable()
export class IndustryPatchingService {
  constructor(private readonly prisma: PrismaService) {}

  async listPatches(filters: {
    versionId?: string;
    industryCode?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(filters.page || 1, 1);
    const limit = Math.min(Math.max(filters.limit || 20, 1), 100);
    const where: any = {};

    if (filters.versionId) where.versionId = filters.versionId;
    if (filters.industryCode) where.industryCode = filters.industryCode;
    if (filters.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      (this.prisma as any).industryPatch.findMany({
        where,
        include: { version: { select: { id: true, version: true, codeName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      (this.prisma as any).industryPatch.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async create(data: {
    versionId: string;
    industryCode: string;
    patchName: string;
    description?: string;
    schemaChanges?: any;
    seedData?: any;
    configOverrides?: any;
    menuOverrides?: any;
    forceUpdate?: boolean;
  }) {
    // Verify version exists
    const version = await (this.prisma as any).appVersion.findUnique({ where: { id: data.versionId } });
    if (!version) throw new NotFoundException('Version not found');

    return (this.prisma as any).industryPatch.create({ data: data as any });
  }

  async applyPatch(id: string, appliedBy: string) {
    const patch = await (this.prisma as any).industryPatch.findUnique({
      where: { id },
      include: { version: true },
    });
    if (!patch) throw new NotFoundException('Patch not found');
    if (patch.status === 'APPLIED') throw new BadRequestException('Patch already applied');

    try {
      // Store rollback data before applying
      const rollbackData = {
        previousStatus: patch.status,
        appliedAt: new Date().toISOString(),
      };

      const updated = await (this.prisma as any).industryPatch.update({
        where: { id },
        data: {
          status: 'APPLIED' as any,
          appliedAt: new Date(),
          appliedBy,
          rollbackData,
        },
      });

      // If forceUpdate is set, create force update entries for affected tenants
      if (patch.forceUpdate) {
        await this.createForceUpdateEntries(patch.version.id, patch.industryCode);
      }

      return updated;
    } catch (error: any) {
      await (this.prisma as any).industryPatch.update({
        where: { id },
        data: {
          status: 'FAILED' as any,
          errorLog: error.message,
        },
      });
      throw new BadRequestException(`Patch application failed: ${error.message}`);
    }
  }

  async rollbackPatch(id: string) {
    const patch = await (this.prisma as any).industryPatch.findUnique({ where: { id } });
    if (!patch) throw new NotFoundException('Patch not found');
    if (patch.status !== 'APPLIED') throw new BadRequestException('Only applied patches can be rolled back');

    return (this.prisma as any).industryPatch.update({
      where: { id },
      data: { status: 'ROLLED_BACK' as any },
    });
  }

  private async createForceUpdateEntries(versionId: string, industryCode: string) {
    // Find all tenants with matching industry code
    const tenants = await this.prisma.identity.tenant.findMany({
      where: { businessTypeCode: industryCode } as any,
      select: { id: true },
    });

    for (const tenant of tenants) {
      await (this.prisma as any).tenantVersion.upsert({
        where: { tenantId_versionId: { tenantId: tenant.id, versionId } } as any,
        create: {
          tenantId: tenant.id,
          versionId,
          currentVersion: '',
          forceUpdatePending: true,
          forceUpdateMessage: `Industry patch requires update for ${industryCode}`,
          forceUpdateDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        } as any,
        update: {
          forceUpdatePending: true,
          forceUpdateMessage: `Industry patch requires update for ${industryCode}`,
          forceUpdateDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }
}
