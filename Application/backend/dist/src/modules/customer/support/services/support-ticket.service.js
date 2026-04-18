"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportTicketService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let SupportTicketService = class SupportTicketService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger('SupportTicket');
    }
    async generateTicketNo() {
        const year = new Date().getFullYear();
        const count = await this.prisma.working.supportTicket.count({
            where: {
                createdAt: {
                    gte: new Date(`${year}-01-01`),
                    lt: new Date(`${year + 1}-01-01`),
                },
            },
        });
        return `TKT-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    async create(data) {
        const ticketNo = await this.generateTicketNo();
        return this.prisma.working.supportTicket.create({
            data: {
                ticketNo,
                tenantId: data.tenantId,
                reportedById: data.reportedById,
                reportedByName: data.reportedByName,
                reportedByEmail: data.reportedByEmail,
                tenantName: data.tenantName,
                subject: data.subject,
                description: data.description,
                category: data.category,
                priority: data.priority,
                screenshots: data.screenshots || [],
                autoContext: data.autoContext,
                linkedErrorIds: data.linkedErrorIds || [],
            },
            include: { messages: true },
        });
    }
    async createFromError(errorLog) {
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
    async findByTenant(tenantId, options) {
        const page = options.page || 1;
        const limit = options.limit || 20;
        const where = { tenantId };
        if (options.status)
            where.status = options.status;
        if (options.priority)
            where.priority = options.priority;
        if (options.category)
            where.category = options.category;
        const [data, total] = await Promise.all([
            this.prisma.working.supportTicket.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: { _count: { select: { messages: true } } },
            }),
            this.prisma.working.supportTicket.count({ where }),
        ]);
        return {
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findAll(options) {
        const page = options.page || 1;
        const limit = options.limit || 20;
        const where = {};
        if (options.tenantId)
            where.tenantId = options.tenantId;
        if (options.status)
            where.status = options.status;
        if (options.priority)
            where.priority = options.priority;
        if (options.category)
            where.category = options.category;
        if (options.assignedToId)
            where.assignedToId = options.assignedToId;
        const [data, total] = await Promise.all([
            this.prisma.working.supportTicket.findMany({
                where,
                orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
                skip: (page - 1) * limit,
                take: limit,
                include: { _count: { select: { messages: true } } },
            }),
            this.prisma.working.supportTicket.count({ where }),
        ]);
        return {
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findById(id) {
        return this.prisma.working.supportTicket.findUnique({
            where: { id },
            include: { messages: { orderBy: { createdAt: 'asc' } } },
        });
    }
    async addMessage(ticketId, data) {
        const msg = await this.prisma.working.supportTicketMessage.create({
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
        if (data.senderType === 'VENDOR') {
            const ticket = await this.prisma.working.supportTicket.findUnique({
                where: { id: ticketId },
            });
            if (ticket && !ticket.firstResponseAt) {
                await this.prisma.working.supportTicket.update({
                    where: { id: ticketId },
                    data: { firstResponseAt: new Date() },
                });
            }
        }
        return msg;
    }
    async updateTicket(id, data) {
        const updateData = {};
        if (data.status)
            updateData.status = data.status;
        if (data.assignedToId)
            updateData.assignedToId = data.assignedToId;
        if (data.assignedToName)
            updateData.assignedToName = data.assignedToName;
        if (data.priority)
            updateData.priority = data.priority;
        if (data.status === 'RESOLVED')
            updateData.resolvedAt = new Date();
        if (data.status === 'CLOSED')
            updateData.closedAt = new Date();
        return this.prisma.working.supportTicket.update({
            where: { id },
            data: updateData,
        });
    }
    async closeTicket(id) {
        return this.prisma.working.supportTicket.update({
            where: { id },
            data: { status: 'CLOSED', closedAt: new Date() },
        });
    }
    async rateTicket(id, rating, comment) {
        return this.prisma.working.supportTicket.update({
            where: { id },
            data: { satisfactionRating: rating, satisfactionComment: comment },
        });
    }
    async getStats() {
        const [open, inProgress, resolved, closed, all] = await Promise.all([
            this.prisma.working.supportTicket.count({ where: { status: 'OPEN' } }),
            this.prisma.working.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
            this.prisma.working.supportTicket.count({ where: { status: 'RESOLVED' } }),
            this.prisma.working.supportTicket.count({ where: { status: 'CLOSED' } }),
            this.prisma.working.supportTicket.findMany({
                where: { firstResponseAt: { not: null } },
                select: { createdAt: true, firstResponseAt: true },
            }),
        ]);
        let avgResponseHours = 0;
        if (all.length > 0) {
            const totalMs = all.reduce((sum, t) => {
                return sum + (t.firstResponseAt.getTime() - t.createdAt.getTime());
            }, 0);
            avgResponseHours =
                Math.round((totalMs / all.length / 3600000) * 10) / 10;
        }
        const ratings = await this.prisma.working.supportTicket.aggregate({
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
    async getContext(ticketId) {
        const ticket = await this.prisma.working.supportTicket.findUnique({
            where: { id: ticketId },
            select: { autoContext: true, linkedErrorIds: true },
        });
        if (!ticket)
            return null;
        let linkedErrors = [];
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
};
exports.SupportTicketService = SupportTicketService;
exports.SupportTicketService = SupportTicketService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupportTicketService);
//# sourceMappingURL=support-ticket.service.js.map