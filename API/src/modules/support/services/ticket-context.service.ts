import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class TicketContextService {
  constructor(private readonly prisma: PrismaService) {}

  async captureContext(
    userId: string,
    tenantId: string,
    userAgent?: string,
    referer?: string,
  ) {
    // Get recent errors for this user (last 24h)
    const recentErrors = await this.prisma.errorLog.findMany({
      where: {
        tenantId,
        userId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        errorCode: true,
        message: true,
        severity: true,
        path: true,
        createdAt: true,
      },
    });

    // Get recent audit actions if audit active
    let lastActions: string[] = [];
    try {
      const recentAuditLogs = await this.prisma.tenantAuditLog.findMany({
        where: {
          tenantId,
          userId,
          createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { description: true },
      });
      lastActions = recentAuditLogs.map((a) => a.description);
    } catch {
      // TenantAuditLog may not have data
    }

    // Get tenant info
    let tenantPlan: string | undefined;
    let industryCode: string | undefined;
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { industryCode: true, name: true },
      });
      industryCode = tenant?.industryCode || undefined;
    } catch {
      // ignore
    }

    return {
      browserInfo: userAgent,
      currentPageUrl: referer,
      appVersion: process.env.npm_package_version || '1.0.0',
      tenantPlan,
      industryCode,
      recentErrors,
      lastActions,
      capturedAt: new Date().toISOString(),
    };
  }
}
