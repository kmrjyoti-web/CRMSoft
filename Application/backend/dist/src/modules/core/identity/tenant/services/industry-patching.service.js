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
exports.IndustryPatchingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let IndustryPatchingService = class IndustryPatchingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listPatches(filters) {
        const page = Math.max(filters.page || 1, 1);
        const limit = Math.min(Math.max(filters.limit || 20, 1), 100);
        const where = {};
        if (filters.versionId)
            where.versionId = filters.versionId;
        if (filters.industryCode)
            where.industryCode = filters.industryCode;
        if (filters.status)
            where.status = filters.status;
        const [data, total] = await Promise.all([
            this.prisma.industryPatch.findMany({
                where,
                include: { version: { select: { id: true, version: true, codeName: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.industryPatch.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async create(data) {
        const version = await this.prisma.appVersion.findUnique({ where: { id: data.versionId } });
        if (!version)
            throw new common_1.NotFoundException('Version not found');
        return this.prisma.industryPatch.create({ data: data });
    }
    async applyPatch(id, appliedBy) {
        const patch = await this.prisma.industryPatch.findUnique({
            where: { id },
            include: { version: true },
        });
        if (!patch)
            throw new common_1.NotFoundException('Patch not found');
        if (patch.status === 'APPLIED')
            throw new common_1.BadRequestException('Patch already applied');
        try {
            const rollbackData = {
                previousStatus: patch.status,
                appliedAt: new Date().toISOString(),
            };
            const updated = await this.prisma.industryPatch.update({
                where: { id },
                data: {
                    status: 'APPLIED',
                    appliedAt: new Date(),
                    appliedBy,
                    rollbackData,
                },
            });
            if (patch.forceUpdate) {
                await this.createForceUpdateEntries(patch.version.id, patch.industryCode);
            }
            return updated;
        }
        catch (error) {
            await this.prisma.industryPatch.update({
                where: { id },
                data: {
                    status: 'FAILED',
                    errorLog: error.message,
                },
            });
            throw new common_1.BadRequestException(`Patch application failed: ${error.message}`);
        }
    }
    async rollbackPatch(id) {
        const patch = await this.prisma.industryPatch.findUnique({ where: { id } });
        if (!patch)
            throw new common_1.NotFoundException('Patch not found');
        if (patch.status !== 'APPLIED')
            throw new common_1.BadRequestException('Only applied patches can be rolled back');
        return this.prisma.industryPatch.update({
            where: { id },
            data: { status: 'ROLLED_BACK' },
        });
    }
    async createForceUpdateEntries(versionId, industryCode) {
        const tenants = await this.prisma.identity.tenant.findMany({
            where: { businessTypeCode: industryCode },
            select: { id: true },
        });
        for (const tenant of tenants) {
            await this.prisma.tenantVersion.upsert({
                where: { tenantId_versionId: { tenantId: tenant.id, versionId } },
                create: {
                    tenantId: tenant.id,
                    versionId,
                    currentVersion: '',
                    forceUpdatePending: true,
                    forceUpdateMessage: `Industry patch requires update for ${industryCode}`,
                    forceUpdateDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
                update: {
                    forceUpdatePending: true,
                    forceUpdateMessage: `Industry patch requires update for ${industryCode}`,
                    forceUpdateDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });
        }
    }
};
exports.IndustryPatchingService = IndustryPatchingService;
exports.IndustryPatchingService = IndustryPatchingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IndustryPatchingService);
//# sourceMappingURL=industry-patching.service.js.map