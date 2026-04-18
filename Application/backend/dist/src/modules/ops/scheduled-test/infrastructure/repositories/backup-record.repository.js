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
exports.PrismaBackupRecordRepository = exports.BACKUP_RECORD_REPOSITORY = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
exports.BACKUP_RECORD_REPOSITORY = Symbol('BACKUP_RECORD_REPOSITORY');
let PrismaBackupRecordRepository = class PrismaBackupRecordRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.platform.databaseBackupRecord.create({ data: data });
    }
    async findById(id) {
        return this.prisma.platform.databaseBackupRecord.findUnique({ where: { id } });
    }
    async findByTenantId(tenantId, limit = 20) {
        return this.prisma.platform.databaseBackupRecord.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async findLatestValidated(tenantId) {
        return this.prisma.platform.databaseBackupRecord.findFirst({
            where: {
                tenantId,
                isValidated: true,
                OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(id, data) {
        return this.prisma.platform.databaseBackupRecord.update({
            where: { id },
            data: data,
        });
    }
};
exports.PrismaBackupRecordRepository = PrismaBackupRecordRepository;
exports.PrismaBackupRecordRepository = PrismaBackupRecordRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaBackupRecordRepository);
//# sourceMappingURL=backup-record.repository.js.map