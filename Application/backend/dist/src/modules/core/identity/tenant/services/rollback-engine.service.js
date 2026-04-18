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
exports.RollbackEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let RollbackEngineService = class RollbackEngineService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listBackups(filters) {
        const page = Math.max(filters.page || 1, 1);
        const limit = Math.min(Math.max(filters.limit || 20, 1), 100);
        const where = {};
        if (filters.versionId)
            where.versionId = filters.versionId;
        if (filters.backupType)
            where.backupType = filters.backupType;
        if (filters.status)
            where.status = filters.status;
        const [data, total] = await Promise.all([
            this.prisma.versionBackup.findMany({
                where,
                include: { version: { select: { id: true, version: true, codeName: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.versionBackup.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async createBackup(data) {
        const version = await this.prisma.appVersion.findUnique({ where: { id: data.versionId } });
        if (!version)
            throw new common_1.NotFoundException('Version not found');
        return this.prisma.versionBackup.create({
            data: {
                versionId: data.versionId,
                backupType: data.backupType ?? 'MANUAL',
                dbDumpPath: data.dbDumpPath,
                configSnapshot: data.configSnapshot ?? {},
                schemaSnapshot: data.schemaSnapshot,
                status: 'COMPLETED',
            },
        });
    }
    async restoreBackup(id, restoredBy) {
        const backup = await this.prisma.versionBackup.findUnique({
            where: { id },
            include: { version: true },
        });
        if (!backup)
            throw new common_1.NotFoundException('Backup not found');
        if (backup.status !== 'COMPLETED') {
            throw new common_1.BadRequestException('Only completed backups can be restored');
        }
        await this.prisma.versionBackup.update({
            where: { id },
            data: { status: 'RESTORING' },
        });
        try {
            const restored = await this.prisma.versionBackup.update({
                where: { id },
                data: {
                    status: 'RESTORED',
                    restoredAt: new Date(),
                    restoredBy,
                },
            });
            await this.prisma.appVersion.update({
                where: { id: backup.versionId },
                data: {
                    status: 'ROLLED_BACK',
                    rollbackAt: new Date(),
                    rollbackReason: `Restored from backup ${id}`,
                },
            });
            return restored;
        }
        catch (error) {
            await this.prisma.versionBackup.update({
                where: { id },
                data: { status: 'FAILED' },
            });
            throw new common_1.BadRequestException(`Restore failed: ${error.message}`);
        }
    }
    async deleteBackup(id) {
        const backup = await this.prisma.versionBackup.findUnique({ where: { id } });
        if (!backup)
            throw new common_1.NotFoundException('Backup not found');
        return this.prisma.versionBackup.delete({ where: { id } });
    }
};
exports.RollbackEngineService = RollbackEngineService;
exports.RollbackEngineService = RollbackEngineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RollbackEngineService);
//# sourceMappingURL=rollback-engine.service.js.map