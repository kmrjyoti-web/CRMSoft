import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class SupportTicketService {
  private readonly logger = new Logger('SupportTicket');

  constructor(private readonly prisma: PrismaService) {}

  /** Generate ticket number: TKT-2026-0001 */
  private async generateTicketNo(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.supportTicket.count({
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    });
    return `TKT-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async create(data: {
    tenantId: string;
    reportedById: string;
    reportedByName?: string;
    reportedByEmail?: string;
    tenantName?: string;
    subject: string;
    description: string;
    category: string;
    priority: string;
    screenshots?: string[];
    autoContext?: any;
    linkedErrorIds?: string[];
  }) {
    const ticketNo = await this.generateTicketNo();
    return this.prisma.supportTicket.create({
      data: {
        ticketNo,
        tenantId: data.tenantId,
        reportedById: data.reportedById,
        reportedByName: data.reportedByName,
        reportedByEmail: data.reportedByEmail,
        tenantName: data.tenantName,
        subject: data.subject,
        description: data.description,
        category: data.category as any,
        priority: data.priority as any,
        screenshots: data.screenshots || [],
        autoContext: data.autoContext,
        linkedErrorIds: data.linkedErrorIds || [],
      },
      include: { messages: true },
    });
  }

  /** Create ticket from auto-reported error */
  async createFromError(errorLog: any) {
    return this.create({
      tenantId: errorLog.tenantId || 'system',
      reportedById: 'system',
      reportedByName: 'Auto-Report System',
      subject: `[Auto] ${errorLog.errorCode}: ${errorLog.message?.slice(0, 100)}`,
      description: `Automatically created from error log.\n\nError Code: ${errorLog.errorCode}\nSeverity: ${errorLog.severity}\nPath: ${errorLog.path}\nMethod: ${errorLog.method}\n\nMessage: ${errorLog.message}`,
      category: 'BUG',
      priority: errorLog.severity === 'CRITICAL' ? 'URGENT' : 'HIGH',
      linkedErrorIds: [errorLog.id],
    });
  }

  async findByTenant(
    tenantId: string,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      priority?: string;
      category?: string;
    },
  ) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const where: any = { tenantId };
    if (options.status) where.status = options.status;
    if (options.priority) where.priority = options.priority;
    if (options.category) where.category = options.category;

    const [data, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { messages: true } } },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    tenantId?: string;
    status?: string;
    priority?: string;
    category?: string;
    assignedToId?: string;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const where: any = {};
    if (options.tenantId) where.tenantId = options.tenantId;
    if (options.status) where.status = options.status;
    if (options.priority) where.priority = options.priority;
    if (options.category) where.category = options.category;
    if (options.assignedToId) where.assignedToId = options.assignedToId;

    const [data, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { messages: true } } },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    return this.prisma.supportTicket.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async addMessage(
    ticketId: string,
    data: {
      senderId: string;
      senderName?: string;
      senderType: string;
      message: string;
      attachments?: string[];
      isInternal?: boolean;
    },
  ) {
    const msg = await this.prisma.supportTicketMessage.create({
      data: {
        ticketId,
        senderId: data.senderId,
        senderName: data.senderName,
        senderType: data.senderType,
        message: data.message,
        attachments: data.attachments || [],
        isInternal: data.isInternal || false,
      },
    });

    // Update firstResponseAt if this is the first vendor response
    if (data.senderType === 'VENDOR') {
      const ticket = await this.prisma.supportTicket.findUnique({
        where: { id: ticketId },
      });
      if (ticket && !ticket.firstResponseAt) {
        await this.prisma.supportTicket.update({
          where: { id: ticketId },
          data: { firstResponseAt: new Date() },
        });
      }
    }

    return msg;
  }

  async updateTicket(
    id: string,
    data: {
      status?: string;
      assignedToId?: string;
      assignedToName?: string;
      priority?: string;
    },
  ) {
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.assignedToId) updateData.assignedToId = data.assignedToId;
    if (data.assignedToName) updateData.assignedToName = data.assignedToName;
    if (data.priority) updateData.priority = data.priority;

    if (data.status === 'RESOLVED') updateData.resolvedAt = new Date();
    if (data.status === 'CLOSED') updateData.closedAt = new Date();

    return this.prisma.supportTicket.update({
      where: { id },
      data: updateData,
    });
  }

  async closeTicket(id: string) {
    return this.prisma.supportTicket.update({
      where: { id },
      data: { status: 'CLOSED', closedAt: new Date() },
    });
  }

  async rateTicket(id: string, rating: number, comment?: string) {
    return this.prisma.supportTicket.update({
      where: { id },
      data: { satisfactionRating: rating, satisfactionComment: comment },
    });
  }

  async getStats() {
    const [open, inProgress, resolved, closed, all] = await Promise.all([
      this.prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      this.prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
      this.prisma.supportTicket.count({ where: { status: 'CLOSED' } }),
      this.prisma.supportTicket.findMany({
        where: { firstResponseAt: { not: null } },
        select: { createdAt: true, firstResponseAt: true },
      }),
    ]);

    // Calculate avg response time in hours
    let avgResponseHours = 0;
    if (all.length > 0) {
      const totalMs = all.reduce((sum, t) => {
        return sum + (t.firstResponseAt!.getTime() - t.createdAt.getTime());
      }, 0);
      avgResponseHours =
        Math.round((totalMs / all.length / 3600000) * 10) / 10;
    }

    // Satisfaction average
    const ratings = await this.prisma.supportTicket.aggregate({
      where: { satisfactionRating: { not: null } },
      _avg: { satisfactionRating: true },
      _count: { satisfactionRating: true },
    });

    return {
      open,
      inProgress,
      resolved,
      closed,
      total: open + inProgress + resolved + closed,
      avgResponseHours,
      avgSatisfaction: ratings._avg.satisfactionRating || 0,
      totalRatings: ratings._count.satisfactionRating,
    };
  }

  async getContext(ticketId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { autoContext: true, linkedErrorIds: true },
    });
    if (!ticket) return null;

    // Fetch linked error details
    let linkedErrors: any[] = [];
    if (ticket.linkedErrorIds.length > 0) {
      linkedErrors = await this.prisma.errorLog.findMany({
        where: { id: { in: ticket.linkedErrorIds } },
        select: {
          id: true,
          errorCode: true,
          message: true,
          severity: true,
          path: true,
          method: true,
          statusCode: true,
          createdAt: true,
        },
      });
    }

    return { autoContext: ticket.autoContext, linkedErrors };
  }
}
