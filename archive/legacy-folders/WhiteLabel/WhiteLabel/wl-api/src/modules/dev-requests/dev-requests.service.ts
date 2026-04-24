import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { DevRequestStatus, DevRequestType, ErrorSeverity } from '@prisma/client';

@Injectable()
export class DevRequestsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async submit(dto: {
    partnerId: string;
    requestType: DevRequestType;
    title: string;
    description?: string;
    priority?: ErrorSeverity;
  }) {
    const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: dto.partnerId } });
    if (!partner) throw new NotFoundException('Partner not found');

    const request = await this.prisma.partnerDevRequest.create({
      data: {
        ...dto,
        status: DevRequestStatus.SUBMITTED,
        priority: dto.priority || ErrorSeverity.MEDIUM,
      },
    });

    await this.audit.log({
      partnerId: dto.partnerId,
      action: 'DEV_REQUEST_SUBMITTED',
      performedBy: partner.email,
      performedByRole: 'PARTNER',
      details: { title: dto.title, requestType: dto.requestType },
    });

    return request;
  }

  async findAll(params: { partnerId?: string; status?: DevRequestStatus; page?: number; limit?: number }) {
    const { partnerId, status, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (partnerId) where.partnerId = partnerId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.partnerDevRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { partner: { select: { companyName: true, partnerCode: true } } },
      }),
      this.prisma.partnerDevRequest.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const r = await this.prisma.partnerDevRequest.findUnique({
      where: { id },
      include: { partner: { select: { companyName: true, email: true } } },
    });
    if (!r) throw new NotFoundException('Dev request not found');
    return r;
  }

  async review(
    id: string,
    dto: {
      action: 'APPROVE' | 'REJECT';
      estimatedHours?: number;
      quotedPrice?: number;
      rejectedReason?: string;
    },
  ) {
    const r = await this.findOne(id);
    if (r.status !== DevRequestStatus.SUBMITTED && r.status !== DevRequestStatus.REVIEWING) {
      throw new BadRequestException('Can only review SUBMITTED or REVIEWING requests');
    }
    const status = dto.action === 'APPROVE' ? DevRequestStatus.APPROVED : DevRequestStatus.REJECTED;
    const updated = await this.prisma.partnerDevRequest.update({
      where: { id },
      data: {
        status,
        estimatedHours: dto.estimatedHours,
        quotedPrice: dto.quotedPrice,
        rejectedReason: dto.rejectedReason,
      },
    });
    await this.audit.log({
      partnerId: r.partnerId,
      action: `DEV_REQUEST_${dto.action}D`,
      performedBy: 'admin',
      performedByRole: 'MASTER_ADMIN',
      details: { id, action: dto.action },
    });
    return updated;
  }

  async assign(id: string, dto: { assignedDeveloper: string; gitBranch?: string }) {
    const r = await this.findOne(id);
    const updated = await this.prisma.partnerDevRequest.update({
      where: { id },
      data: { ...dto, status: DevRequestStatus.IN_PROGRESS },
    });
    await this.audit.log({
      partnerId: r.partnerId,
      action: 'DEV_REQUEST_ASSIGNED',
      performedBy: 'admin',
      performedByRole: 'MASTER_ADMIN',
      details: { id, developer: dto.assignedDeveloper },
    });
    return updated;
  }

  async deliver(id: string) {
    const r = await this.findOne(id);
    if (r.status !== DevRequestStatus.IN_PROGRESS && r.status !== DevRequestStatus.TESTING) {
      throw new BadRequestException('Request must be IN_PROGRESS or TESTING to deliver');
    }
    const updated = await this.prisma.partnerDevRequest.update({
      where: { id },
      data: { status: DevRequestStatus.DELIVERED, deliveredAt: new Date() },
    });
    await this.audit.log({
      partnerId: r.partnerId,
      action: 'DEV_REQUEST_DELIVERED',
      performedBy: 'admin',
      performedByRole: 'MASTER_ADMIN',
      details: { id },
    });
    return updated;
  }

  async accept(id: string, actualHours?: number) {
    const r = await this.findOne(id);
    if (r.status !== DevRequestStatus.DELIVERED) {
      throw new BadRequestException('Can only accept DELIVERED requests');
    }
    const updated = await this.prisma.partnerDevRequest.update({
      where: { id },
      data: { status: DevRequestStatus.ACCEPTED, acceptedAt: new Date(), actualHours },
    });
    await this.audit.log({
      partnerId: r.partnerId,
      action: 'DEV_REQUEST_ACCEPTED',
      performedBy: 'partner',
      performedByRole: 'PARTNER',
      details: { id },
    });
    return updated;
  }

  async setDueDate(id: string, dueDate: Date, slaHours?: number) {
    const r = await this.findOne(id);
    return this.prisma.partnerDevRequest.update({
      where: { id },
      data: { dueDate, ...(slaHours !== undefined ? { slaHours } : {}) },
    });
  }

  async getOverdue() {
    const now = new Date();
    return this.prisma.partnerDevRequest.findMany({
      where: {
        dueDate: { lt: now },
        status: { notIn: ['ACCEPTED', 'REJECTED'] as any[] },
      },
      include: { partner: { select: { companyName: true, partnerCode: true } } },
      orderBy: { dueDate: 'asc' },
    });
  }

  async addComment(requestId: string, dto: { authorRole: string; authorName: string; message: string; isInternal?: boolean }) {
    await this.findOne(requestId); // validates existence
    return this.prisma.partnerDevRequestComment.create({
      data: { requestId, ...dto, isInternal: dto.isInternal ?? false },
    });
  }

  async getComments(requestId: string, isPartner = false) {
    await this.findOne(requestId);
    const where: any = { requestId };
    if (isPartner) where.isInternal = false; // partners can't see internal notes
    return this.prisma.partnerDevRequestComment.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
  }

  async getDashboard() {
    const now = new Date();
    const [byStatus, overdue, recentComments] = await Promise.all([
      this.prisma.partnerDevRequest.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.partnerDevRequest.count({
        where: { dueDate: { lt: now }, status: { notIn: ['ACCEPTED', 'REJECTED'] as any[] } },
      }),
      this.prisma.partnerDevRequestComment.count({
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      }),
    ]);
    return {
      byStatus: byStatus.map((g) => ({ status: g.status, count: g._count.id })),
      overdueCount: overdue,
      recentCommentsToday: recentComments,
    };
  }
}
