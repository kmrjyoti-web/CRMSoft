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
exports.DevRequestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const client_1 = require("@prisma/client");
let DevRequestsService = class DevRequestsService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async submit(dto) {
        const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: dto.partnerId } });
        if (!partner)
            throw new common_1.NotFoundException('Partner not found');
        const request = await this.prisma.partnerDevRequest.create({
            data: {
                ...dto,
                status: client_1.DevRequestStatus.SUBMITTED,
                priority: dto.priority || client_1.ErrorSeverity.MEDIUM,
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
    async findAll(params) {
        const { partnerId, status, page = 1, limit = 20 } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (partnerId)
            where.partnerId = partnerId;
        if (status)
            where.status = status;
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
    async findOne(id) {
        const r = await this.prisma.partnerDevRequest.findUnique({
            where: { id },
            include: { partner: { select: { companyName: true, email: true } } },
        });
        if (!r)
            throw new common_1.NotFoundException('Dev request not found');
        return r;
    }
    async review(id, dto) {
        const r = await this.findOne(id);
        if (r.status !== client_1.DevRequestStatus.SUBMITTED && r.status !== client_1.DevRequestStatus.REVIEWING) {
            throw new common_1.BadRequestException('Can only review SUBMITTED or REVIEWING requests');
        }
        const status = dto.action === 'APPROVE' ? client_1.DevRequestStatus.APPROVED : client_1.DevRequestStatus.REJECTED;
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
    async assign(id, dto) {
        const r = await this.findOne(id);
        const updated = await this.prisma.partnerDevRequest.update({
            where: { id },
            data: { ...dto, status: client_1.DevRequestStatus.IN_PROGRESS },
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
    async deliver(id) {
        const r = await this.findOne(id);
        if (r.status !== client_1.DevRequestStatus.IN_PROGRESS && r.status !== client_1.DevRequestStatus.TESTING) {
            throw new common_1.BadRequestException('Request must be IN_PROGRESS or TESTING to deliver');
        }
        const updated = await this.prisma.partnerDevRequest.update({
            where: { id },
            data: { status: client_1.DevRequestStatus.DELIVERED, deliveredAt: new Date() },
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
    async accept(id, actualHours) {
        const r = await this.findOne(id);
        if (r.status !== client_1.DevRequestStatus.DELIVERED) {
            throw new common_1.BadRequestException('Can only accept DELIVERED requests');
        }
        const updated = await this.prisma.partnerDevRequest.update({
            where: { id },
            data: { status: client_1.DevRequestStatus.ACCEPTED, acceptedAt: new Date(), actualHours },
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
    async setDueDate(id, dueDate, slaHours) {
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
                status: { notIn: ['ACCEPTED', 'REJECTED'] },
            },
            include: { partner: { select: { companyName: true, partnerCode: true } } },
            orderBy: { dueDate: 'asc' },
        });
    }
    async addComment(requestId, dto) {
        await this.findOne(requestId);
        return this.prisma.partnerDevRequestComment.create({
            data: { requestId, ...dto, isInternal: dto.isInternal ?? false },
        });
    }
    async getComments(requestId, isPartner = false) {
        await this.findOne(requestId);
        const where = { requestId };
        if (isPartner)
            where.isInternal = false;
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
                where: { dueDate: { lt: now }, status: { notIn: ['ACCEPTED', 'REJECTED'] } },
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
};
exports.DevRequestsService = DevRequestsService;
exports.DevRequestsService = DevRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], DevRequestsService);
//# sourceMappingURL=dev-requests.service.js.map