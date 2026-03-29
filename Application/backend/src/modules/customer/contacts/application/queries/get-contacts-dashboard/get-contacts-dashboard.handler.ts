// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetContactsDashboardQuery } from './get-contacts-dashboard.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetContactsDashboardQuery)
export class GetContactsDashboardHandler implements IQueryHandler<GetContactsDashboardQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetContactsDashboardQuery) {
    const { tenantId, dateFrom, dateTo } = query;
    const dateFilter: any = {};
    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo) dateFilter.lte = new Date(dateTo + 'T23:59:59.999Z');

    const baseWhere = { tenantId, isDeleted: false };
    const dateWhere = dateFrom || dateTo
      ? { ...baseWhere, createdAt: dateFilter }
      : baseWhere;

    // ── Stats ────────────────────────────────────────────────
    const [
      totalContacts, activeContacts, inactiveContacts,
      verifiedContacts, totalOrganizations, verifiedOrganizations,
      totalCustomers,
    ] = await Promise.all([
      this.prisma.working.contact.count({ where: dateWhere }),
      this.prisma.working.contact.count({ where: { ...dateWhere, isActive: true } }),
      this.prisma.working.contact.count({ where: { ...dateWhere, isActive: false } }),
      this.prisma.working.contact.count({ where: { ...dateWhere, entityVerificationStatus: 'VERIFIED' } }),
      this.prisma.working.organization.count({ where: { tenantId, isDeleted: false } }),
      this.prisma.working.organization.count({ where: { tenantId, isDeleted: false, entityVerificationStatus: 'VERIFIED' } }),
      this.prisma.working.contact.count({ where: { ...dateWhere, isActive: true, entityVerificationStatus: 'VERIFIED' } }),
    ]);

    const notVerifiedContacts = totalContacts - verifiedContacts;

    // ── Industry-wise (from linked organizations) ────────────
    const industryGroups = await this.prisma.working.organization.groupBy({
      by: ['industry'],
      where: { tenantId, isDeleted: false, industry: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });
    const industryTotal = industryGroups.reduce((s, g) => s + g._count.id, 0) || 1;
    const industryWise = industryGroups.map((g) => ({
      industry: g.industry || 'Unknown',
      count: g._count.id,
      percentage: Math.round((g._count.id / industryTotal) * 100),
    }));

    // ── Source-wise (from raw contacts) ─────────────────────
    const sourceGroups = await this.prisma.working.rawContact.groupBy({
      by: ['source'],
      where: { tenantId, isDeleted: false },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });
    const sourceTotal = sourceGroups.reduce((s, g) => s + g._count.id, 0) || 1;
    const sourceWise = sourceGroups.map((g) => ({
      source: g.source || 'MANUAL',
      count: g._count.id,
      percentage: Math.round((g._count.id / sourceTotal) * 100),
    }));

    // ── Verification trend (last 6 months) ───────────────────
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trendContacts = await this.prisma.working.contact.findMany({
      where: { tenantId, isDeleted: false, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, entityVerificationStatus: true },
    });

    const trendMap: Record<string, { verified: number; unverified: number }> = {};
    for (const c of trendContacts) {
      const key = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (!trendMap[key]) trendMap[key] = { verified: 0, unverified: 0 };
      if (c.entityVerificationStatus === 'VERIFIED') trendMap[key].verified++;
      else trendMap[key].unverified++;
    }
    const verificationTrend = Object.entries(trendMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, counts]) => ({ period, ...counts }));

    // ── Department-wise ──────────────────────────────────────
    const deptGroups = await this.prisma.working.contact.groupBy({
      by: ['department'],
      where: { ...dateWhere, department: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });
    const departmentWise = deptGroups.map((g) => ({
      department: g.department || 'Unknown',
      count: g._count.id,
    }));

    // ── Recent contacts ──────────────────────────────────────
    const recentRaw = await this.prisma.working.contact.findMany({
      where: { tenantId, isDeleted: false },
      select: {
        id: true, firstName: true, lastName: true,
        designation: true, department: true,
        entityVerificationStatus: true, isActive: true, createdAt: true,
        organization: { select: { id: true, name: true } },
        communications: {
          where: { isDeleted: false },
          take: 2,
          select: { type: true, value: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const recentContacts = recentRaw.map((c) => {
      const email = c.communications.find((cm) => cm.type === 'EMAIL')?.value || null;
      const phone = c.communications.find((cm) => cm.type === 'PHONE' || cm.type === 'MOBILE')?.value || null;
      return {
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        fullName: `${c.firstName} ${c.lastName}`.trim(),
        designation: c.designation || null,
        department: c.department || null,
        email,
        phone,
        organizationId: c.organization?.id || null,
        organizationName: c.organization?.name || null,
        entityVerificationStatus: c.entityVerificationStatus,
        isActive: c.isActive,
        createdAt: c.createdAt,
      };
    });

    return {
      stats: {
        totalContacts, activeContacts, inactiveContacts,
        verifiedContacts, notVerifiedContacts,
        totalOrganizations, verifiedOrganizations, totalCustomers,
      },
      industryWise,
      sourceWise,
      verificationTrend,
      departmentWise,
      recentContacts,
    };
  }
}
