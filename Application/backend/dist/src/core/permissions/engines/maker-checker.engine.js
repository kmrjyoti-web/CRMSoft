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
exports.MakerCheckerEngine = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MakerCheckerEngine = class MakerCheckerEngine {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async requiresApproval(ctx) {
        const rule = await this.findRule(ctx);
        if (!rule)
            return { required: false };
        if (rule.skipForRoles.includes(ctx.roleName))
            return { required: false };
        if (rule.amountThreshold && rule.amountField && ctx.attributes) {
            const amount = ctx.attributes[rule.amountField] ?? ctx.attributes.amount;
            if (amount !== undefined && amount < rule.amountThreshold) {
                return { required: false };
            }
        }
        return { required: true, checkerRole: rule.checkerRole };
    }
    async submit(ctx, makerNote) {
        const { required, checkerRole } = await this.requiresApproval(ctx);
        if (!required)
            return null;
        const rule = await this.findRule(ctx);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + (rule?.expiryHours || 48));
        return this.prisma.approvalRequest.create({
            data: {
                entityType: ctx.resourceType || '',
                entityId: ctx.resourceId,
                action: ctx.action,
                payload: ctx.attributes || {},
                makerId: ctx.userId,
                checkerRole: checkerRole,
                status: 'PENDING',
                makerNote,
                expiresAt,
            },
        });
    }
    async approve(requestId, checkerId, note) {
        const request = await this.prisma.approvalRequest.findUnique({
            where: { id: requestId },
        });
        if (!request)
            throw new common_1.BadRequestException('Request not found');
        if (request.status !== 'PENDING')
            throw new common_1.BadRequestException('Request is not pending');
        if (request.makerId === checkerId)
            throw new common_1.BadRequestException('Self-approval is not allowed');
        if (new Date() > request.expiresAt) {
            await this.prisma.approvalRequest.update({
                where: { id: requestId },
                data: { status: 'EXPIRED' },
            });
            throw new common_1.BadRequestException('Request has expired');
        }
        return this.prisma.approvalRequest.update({
            where: { id: requestId },
            data: { status: 'APPROVED', checkerId, checkerNote: note, decidedAt: new Date() },
        });
    }
    async reject(requestId, checkerId, note) {
        const request = await this.prisma.approvalRequest.findUnique({
            where: { id: requestId },
        });
        if (!request)
            throw new common_1.BadRequestException('Request not found');
        if (request.status !== 'PENDING')
            throw new common_1.BadRequestException('Request is not pending');
        return this.prisma.approvalRequest.update({
            where: { id: requestId },
            data: { status: 'REJECTED', checkerId, checkerNote: note, decidedAt: new Date() },
        });
    }
    async getPendingForRole(checkerRole) {
        return this.prisma.approvalRequest.findMany({
            where: {
                checkerRole,
                status: 'PENDING',
                expiresAt: { gt: new Date() },
            },
            include: { maker: { select: { id: true, firstName: true, lastName: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async hasApproval(action, entityId, makerId) {
        const found = await this.prisma.approvalRequest.findFirst({
            where: { action, entityId, makerId, status: 'APPROVED', expiresAt: { gt: new Date() } },
        });
        return !!found;
    }
    async findRule(ctx) {
        const exact = await this.prisma.approvalRule.findFirst({
            where: { entityType: ctx.resourceType || '', action: ctx.action, isActive: true },
        });
        if (exact)
            return exact;
        return this.prisma.approvalRule.findFirst({
            where: { entityType: ctx.resourceType || '', action: '*', isActive: true },
        });
    }
};
exports.MakerCheckerEngine = MakerCheckerEngine;
exports.MakerCheckerEngine = MakerCheckerEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MakerCheckerEngine);
//# sourceMappingURL=maker-checker.engine.js.map