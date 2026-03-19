import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../common/utils/api-response';

interface RecycleBinItem {
  id: string;
  entityType: string;
  name: string;
  subtitle?: string;
  deletedAt: string | null;
  deletedBy?: string;
}

@ApiTags('Recycle Bin')
@ApiBearerAuth()
@Controller('recycle-bin')
export class RecycleBinController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all soft-deleted records across all entities' })
  @ApiQuery({ name: 'entityType', required: false, description: 'Filter by entity type' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAll(
    @Query('entityType') entityType?: string,
    @Query('limit') limit?: string,
  ) {
    const take = limit ? parseInt(limit, 10) : 10000;
    const items: RecycleBinItem[] = [];
    const deletedByIds = new Set<string>();

    const shouldInclude = (type: string) => !entityType || entityType === type;

    // ── Contacts ──
    if (shouldInclude('contact')) {
      const contacts = await this.prisma.contact.findMany({
        where: { isDeleted: true },
        take,
        orderBy: { deletedAt: 'desc' },
      });
      for (const c of contacts) {
        if (c.deletedById) deletedByIds.add(c.deletedById);
        items.push({
          id: c.id,
          entityType: 'contact',
          name: `${c.firstName} ${c.lastName}`,
          subtitle: c.designation ?? undefined,
          deletedAt: c.deletedAt?.toISOString() ?? null,
          deletedBy: c.deletedById ?? undefined,
        });
      }
    }

    // ── Organizations ──
    if (shouldInclude('organization')) {
      const orgs = await this.prisma.organization.findMany({
        where: { isDeleted: true },
        take,
        orderBy: { deletedAt: 'desc' },
      });
      for (const o of orgs) {
        if (o.deletedById) deletedByIds.add(o.deletedById);
        items.push({
          id: o.id,
          entityType: 'organization',
          name: o.name,
          subtitle: o.industry ?? undefined,
          deletedAt: o.deletedAt?.toISOString() ?? null,
          deletedBy: o.deletedById ?? undefined,
        });
      }
    }

    // ── Leads ──
    if (shouldInclude('lead')) {
      const leads = await this.prisma.lead.findMany({
        where: { isDeleted: true },
        take,
        orderBy: { deletedAt: 'desc' },
        include: {
          contact: { select: { firstName: true, lastName: true } },
        },
      });
      for (const l of leads) {
        if (l.deletedById) deletedByIds.add(l.deletedById);
        items.push({
          id: l.id,
          entityType: 'lead',
          name: l.leadNumber,
          subtitle: l.contact ? `${l.contact.firstName} ${l.contact.lastName}` : undefined,
          deletedAt: l.deletedAt?.toISOString() ?? null,
          deletedBy: l.deletedById ?? undefined,
        });
      }
    }

    // ── Activities ──
    if (shouldInclude('activity')) {
      const activities = await this.prisma.activity.findMany({
        where: { isDeleted: true },
        take,
        orderBy: { deletedAt: 'desc' },
      });
      for (const a of activities) {
        if (a.deletedById) deletedByIds.add(a.deletedById);
        items.push({
          id: a.id,
          entityType: 'activity',
          name: a.subject,
          subtitle: a.type,
          deletedAt: a.deletedAt?.toISOString() ?? null,
          deletedBy: a.deletedById ?? undefined,
        });
      }
    }

    // ── Raw Contacts ──
    if (shouldInclude('raw_contact')) {
      const rcs = await this.prisma.rawContact.findMany({
        where: { isDeleted: true },
        take,
        orderBy: { deletedAt: 'desc' },
      });
      for (const r of rcs) {
        if (r.deletedById) deletedByIds.add(r.deletedById);
        items.push({
          id: r.id,
          entityType: 'raw_contact',
          name: `${r.firstName} ${r.lastName}`,
          subtitle: r.companyName ?? undefined,
          deletedAt: r.deletedAt?.toISOString() ?? null,
          deletedBy: r.deletedById ?? undefined,
        });
      }
    }

    // ── Users ──
    if (shouldInclude('user')) {
      const users = await this.prisma.user.findMany({
        where: { isDeleted: true },
        take,
        orderBy: { deletedAt: 'desc' },
      });
      for (const u of users) {
        if (u.deletedById) deletedByIds.add(u.deletedById);
        items.push({
          id: u.id,
          entityType: 'user',
          name: `${u.firstName} ${u.lastName}`,
          subtitle: u.email,
          deletedAt: u.deletedAt?.toISOString() ?? null,
          deletedBy: u.deletedById ?? undefined,
        });
      }
    }

    // ── Resolve deletedBy user names in a single batch query ──
    if (deletedByIds.size > 0) {
      const deleters = await this.prisma.user.findMany({
        where: { id: { in: Array.from(deletedByIds) } },
        select: { id: true, firstName: true, lastName: true },
      });
      const deleterMap = new Map(
        deleters.map((d) => [d.id, `${d.firstName} ${d.lastName}`]),
      );
      for (const item of items) {
        if (item.deletedBy && deleterMap.has(item.deletedBy)) {
          item.deletedBy = deleterMap.get(item.deletedBy);
        }
      }
    }

    // Sort all items by deletedAt descending
    items.sort((a, b) => {
      if (!a.deletedAt) return 1;
      if (!b.deletedAt) return -1;
      return new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime();
    });

    return ApiResponse.success(items, 'Recycle bin items fetched');
  }
}
