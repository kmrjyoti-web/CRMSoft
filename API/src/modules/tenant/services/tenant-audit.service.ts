import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class TenantAuditService {
  private readonly logger = new Logger('TenantAudit');
  /** In-memory cache of active audit sessions per tenant (tenantId -> sessionId) */
  private activeAudits = new Map<string, { id: string; tenantId: string }>();

  constructor(private readonly prisma: PrismaService) {
    this.loadActiveAudits();
  }

  /* ------------------------------------------------------------------ */
  /*  Bootstrap                                                         */
  /* ------------------------------------------------------------------ */

  private async loadActiveAudits() {
    try {
      const active = await this.prisma.tenantAuditSession.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, tenantId: true },
      });
      for (const s of active) {
        this.activeAudits.set(s.tenantId, { id: s.id, tenantId: s.tenantId });
      }
      this.logger.log(`Loaded ${active.length} active audit sessions`);
    } catch (err) {
      this.logger.warn('Could not load active audit sessions (table may not exist yet)');
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Session management                                                */
  /* ------------------------------------------------------------------ */

  getActiveAudit(tenantId: string) {
    return this.activeAudits.get(tenantId) || null;
  }

  async startAudit(
    tenantId: string,
    startedById: string,
    startedByName: string,
    reason: string,
    scheduledDays?: number,
  ) {
    const existing = await this.prisma.tenantAuditSession.findFirst({
      where: { tenantId, status: 'ACTIVE' },
    });
    if (existing) {
      throw new Error('An audit session is already active for this tenant');
    }

    const scheduledEndAt = scheduledDays
      ? new Date(Date.now() + scheduledDays * 86_400_000)
      : undefined;

    const session = await this.prisma.tenantAuditSession.create({
      data: { tenantId, startedById, startedByName, reason, scheduledEndAt },
    });

    this.activeAudits.set(tenantId, { id: session.id, tenantId });
    return session;
  }

  async stopAudit(tenantId: string) {
    const session = await this.prisma.tenantAuditSession.findFirst({
      where: { tenantId, status: 'ACTIVE' },
    });
    if (!session) {
      throw new Error('No active audit session for this tenant');
    }

    const uniqueUsersResult = await this.prisma.tenantAuditLog.groupBy({
      by: ['userId'],
      where: { sessionId: session.id },
    });

    const updated = await this.prisma.tenantAuditSession.update({
      where: { id: session.id },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
        uniqueUsers: uniqueUsersResult.length,
      },
    });

    this.activeAudits.delete(tenantId);
    return updated;
  }

  async getAuditStatus(tenantId: string) {
    return this.prisma.tenantAuditSession.findFirst({
      where: { tenantId, status: 'ACTIVE' },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Logs                                                              */
  /* ------------------------------------------------------------------ */

  async getAuditLogs(
    sessionId: string,
    options: {
      page?: number;
      limit?: number;
      userId?: string;
      actionType?: string;
      entityType?: string;
    },
  ) {
    const page = options.page || 1;
    const limit = options.limit || 50;

    const where: any = { sessionId };
    if (options.userId) where.userId = options.userId;
    if (options.actionType) where.actionType = options.actionType;
    if (options.entityType) where.entityType = options.entityType;

    const [data, total] = await Promise.all([
      this.prisma.tenantAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.tenantAuditLog.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Reporting                                                         */
  /* ------------------------------------------------------------------ */

  async getLatestSession(tenantId: string) {
    return this.prisma.tenantAuditSession.findFirst({
      where: { tenantId },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getAuditReport(sessionId: string) {
    const session = await this.prisma.tenantAuditSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new Error('Audit session not found');

    const [actionBreakdown, userBreakdown, entityBreakdown] = await Promise.all([
      this.prisma.tenantAuditLog.groupBy({
        by: ['actionType'],
        where: { sessionId },
        _count: { id: true },
      }),
      this.prisma.tenantAuditLog.groupBy({
        by: ['userId', 'userName'],
        where: { sessionId },
        _count: { id: true },
      }),
      this.prisma.tenantAuditLog.groupBy({
        by: ['entityType'],
        where: { sessionId },
        _count: { id: true },
      }),
    ]);

    return {
      session,
      summary: {
        totalActions: session.totalActions,
        uniqueUsers: session.uniqueUsers,
        byAction: actionBreakdown.map((a) => ({
          action: a.actionType,
          count: a._count.id,
        })),
        byUser: userBreakdown.map((u) => ({
          userId: u.userId,
          userName: u.userName,
          count: u._count.id,
        })),
        byEntity: entityBreakdown.map((e) => ({
          entityType: e.entityType,
          count: e._count.id,
        })),
      },
    };
  }

  async getAuditHistory(tenantId: string) {
    return this.prisma.tenantAuditSession.findMany({
      where: { tenantId },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });
  }

  async getAllActiveAudits() {
    return this.prisma.tenantAuditSession.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { startedAt: 'desc' },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Activity logging (called by middleware)                            */
  /* ------------------------------------------------------------------ */

  async logActivity(data: {
    sessionId: string;
    tenantId: string;
    userId: string;
    userName?: string;
    userRole?: string;
    actionType: string;
    entityType?: string;
    entityId?: string;
    description: string;
    metadata?: any;
    pageUrl?: string;
    durationMs?: number;
    ipAddress?: string;
    userAgent?: string;
    deviceType?: string;
  }) {
    await this.prisma.tenantAuditLog.create({ data: data as any });
    await this.prisma.tenantAuditSession.update({
      where: { id: data.sessionId },
      data: { totalActions: { increment: 1 } },
    });
  }
}
