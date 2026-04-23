import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ErrorSeverity } from '@prisma/client';

@Injectable()
export class ErrorsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async collectErrors(partnerId: string, errors: Array<{
    errorCode?: string;
    severity: ErrorSeverity;
    message: string;
    module?: string;
    component?: string;
    endpoint?: string;
    stackTrace?: string;
  }>) {
    const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
    if (!partner) throw new NotFoundException('Partner not found');

    const created = await Promise.all(errors.map((e) =>
      this.prisma.partnerErrorLog.create({
        data: {
          partnerId,
          ...e,
          isReportedToMaster: e.severity === ErrorSeverity.CRITICAL,
        },
      })
    ));

    // Flag critical errors
    const criticals = created.filter((e) => e.severity === ErrorSeverity.CRITICAL);
    if (criticals.length > 0) {
      await this.audit.log({
        partnerId,
        action: 'CRITICAL_ERRORS_COLLECTED',
        performedBy: 'system',
        performedByRole: 'MASTER_ADMIN',
        details: { count: criticals.length },
      });
    }

    return { collected: created.length, critical: criticals.length };
  }

  async getPartnerErrors(partnerId: string, params: { severity?: ErrorSeverity; page?: number; limit?: number }) {
    const { page = 1, limit = 20, severity } = params;
    const skip = (page - 1) * limit;
    const where: any = { partnerId };
    if (severity) where.severity = severity;

    const [data, total] = await Promise.all([
      this.prisma.partnerErrorLog.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.partnerErrorLog.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getErrorDashboard(partnerId?: string) {
    const where: any = partnerId ? { partnerId } : {};

    const [bySeverity, unresolved, critical, recentErrors] = await Promise.all([
      this.prisma.partnerErrorLog.groupBy({
        by: ['severity'],
        where,
        _count: { id: true },
      }),
      this.prisma.partnerErrorLog.count({ where: { ...where, resolvedAt: null } }),
      this.prisma.partnerErrorLog.count({ where: { ...where, severity: 'CRITICAL' } }),
      this.prisma.partnerErrorLog.findMany({ where, take: 10, orderBy: { createdAt: 'desc' } }),
    ]);

    return {
      bySeverity: bySeverity.map((g) => ({ severity: g.severity, count: g._count.id })),
      unresolved,
      critical,
      recentErrors,
    };
  }

  async resolveError(errorId: string, resolution: string) {
    const error = await this.prisma.partnerErrorLog.findUnique({ where: { id: errorId } });
    if (!error) throw new NotFoundException('Error not found');
    return this.prisma.partnerErrorLog.update({
      where: { id: errorId },
      data: { resolvedAt: new Date(), resolvedBy: 'admin', resolution },
    });
  }
}
