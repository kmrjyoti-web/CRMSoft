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
exports.VersionControlService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let VersionControlService = class VersionControlService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listVersions(filters) {
        const page = Math.max(filters.page || 1, 1);
        const limit = Math.min(Math.max(filters.limit || 20, 1), 100);
        const where = {};
        if (filters.status)
            where.status = filters.status;
        if (filters.releaseType)
            where.releaseType = filters.releaseType;
        if (filters.search) {
            where.OR = [
                { version: { contains: filters.search, mode: 'insensitive' } },
                { codeName: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.appVersion.findMany({
                where,
                include: { _count: { select: { patches: true, tenantVersions: true, backups: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.appVersion.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async getById(id) {
        const version = await this.prisma.appVersion.findUnique({
            where: { id },
            include: {
                patches: { orderBy: { createdAt: 'desc' } },
                tenantVersions: { orderBy: { createdAt: 'desc' }, take: 20 },
                backups: { orderBy: { createdAt: 'desc' } },
                _count: { select: { patches: true, tenantVersions: true, backups: true } },
            },
        });
        if (!version)
            throw new common_1.NotFoundException('Version not found');
        return version;
    }
    async create(data) {
        if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(data.version)) {
            throw new common_1.BadRequestException('Version must follow semantic versioning (e.g., 1.2.3)');
        }
        const existing = await this.prisma.appVersion.findUnique({ where: { version: data.version } });
        if (existing)
            throw new common_1.BadRequestException(`Version ${data.version} already exists`);
        return this.prisma.appVersion.create({
            data: {
                version: data.version,
                codeName: data.codeName,
                releaseType: data.releaseType ?? 'MINOR',
                changelog: data.changelog ?? [],
                breakingChanges: data.breakingChanges ?? [],
                migrationNotes: data.migrationNotes,
                modulesUpdated: data.modulesUpdated ?? [],
                schemaChanges: data.schemaChanges,
                gitBranch: data.gitBranch,
            },
        });
    }
    async update(id, data) {
        await this.getById(id);
        return this.prisma.appVersion.update({ where: { id }, data: data });
    }
    async publish(id, deployedBy) {
        const version = await this.getById(id);
        if (version.status === 'PUBLISHED') {
            throw new common_1.BadRequestException('Version is already published');
        }
        await this.prisma.versionBackup.create({
            data: {
                versionId: id,
                backupType: 'PRE_DEPLOY',
                configSnapshot: {},
                status: 'COMPLETED',
            },
        });
        return this.prisma.appVersion.update({
            where: { id },
            data: {
                status: 'PUBLISHED',
                deployedAt: new Date(),
                deployedBy,
                gitTag: `v${version.version}`,
            },
        });
    }
    async rollback(id, reason, rolledBackBy) {
        const version = await this.getById(id);
        if (version.status !== 'PUBLISHED') {
            throw new common_1.BadRequestException('Only published versions can be rolled back');
        }
        return this.prisma.appVersion.update({
            where: { id },
            data: {
                status: 'ROLLED_BACK',
                rollbackAt: new Date(),
                rollbackReason: reason,
            },
        });
    }
    async checkForceUpdate(tenantId) {
        const pending = await this.prisma.tenantVersion.findFirst({
            where: {
                tenantId,
                forceUpdatePending: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!pending) {
            return { pending: false, message: '', deadline: null };
        }
        return {
            pending: true,
            message: pending.forceUpdateMessage || 'A system update is required',
            deadline: pending.forceUpdateDeadline,
        };
    }
    async getStats() {
        const [total, byStatus, byReleaseType, recentDeployments] = await Promise.all([
            this.prisma.appVersion.count(),
            this.prisma.appVersion.groupBy({ by: ['status'], _count: true }),
            this.prisma.appVersion.groupBy({ by: ['releaseType'], _count: true }),
            this.prisma.appVersion.findMany({
                where: { status: 'PUBLISHED' },
                orderBy: { deployedAt: 'desc' },
                take: 5,
                select: { id: true, version: true, codeName: true, deployedAt: true },
            }),
        ]);
        return {
            total,
            byStatus: byStatus.map((g) => ({ status: g.status, count: g._count })),
            byReleaseType: byReleaseType.map((g) => ({ releaseType: g.releaseType, count: g._count })),
            recentDeployments,
        };
    }
};
exports.VersionControlService = VersionControlService;
exports.VersionControlService = VersionControlService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VersionControlService);
//# sourceMappingURL=version-control.service.js.map