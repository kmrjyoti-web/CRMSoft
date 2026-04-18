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
exports.PrismaManualTestLogRepository = exports.MANUAL_TEST_LOG_REPOSITORY = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
exports.MANUAL_TEST_LOG_REPOSITORY = Symbol('MANUAL_TEST_LOG_REPOSITORY');
let PrismaManualTestLogRepository = class PrismaManualTestLogRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.platform.manualTestLog.create({ data: data });
    }
    async findById(id) {
        return this.prisma.platform.manualTestLog.findUnique({ where: { id } });
    }
    async findByTenantId(tenantId, filters = {}) {
        const { testRunId, module, status, userId, page = 1, limit = 50 } = filters;
        return this.prisma.platform.manualTestLog.findMany({
            where: {
                tenantId,
                ...(testRunId ? { testRunId } : {}),
                ...(module ? { module } : {}),
                ...(status ? { status } : {}),
                ...(userId ? { userId } : {}),
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }
    async update(id, data) {
        return this.prisma.platform.manualTestLog.update({ where: { id }, data: data });
    }
    async getSummary(tenantId, filters = {}) {
        const { testRunId, from, to } = filters;
        const where = {
            tenantId,
            ...(testRunId ? { testRunId } : {}),
            ...(from || to ? {
                createdAt: {
                    ...(from ? { gte: new Date(from) } : {}),
                    ...(to ? { lte: new Date(to) } : {}),
                },
            } : {}),
        };
        const [total, byStatus, byModule] = await Promise.all([
            this.prisma.platform.manualTestLog.count({ where }),
            this.prisma.platform.manualTestLog.groupBy({
                by: ['status'],
                where,
                _count: { status: true },
            }),
            this.prisma.platform.manualTestLog.groupBy({
                by: ['module', 'status'],
                where,
                _count: { id: true },
            }),
        ]);
        const moduleMap = {};
        for (const row of byModule) {
            if (!moduleMap[row.module])
                moduleMap[row.module] = {};
            moduleMap[row.module][row.status] = row._count.id;
        }
        return {
            total,
            byStatus: byStatus.reduce((acc, row) => {
                acc[row.status] = row._count.status;
                return acc;
            }, {}),
            byModule: Object.entries(moduleMap).map(([mod, counts]) => ({
                module: mod,
                ...counts,
                total: Object.values(counts).reduce((s, n) => s + n, 0),
            })),
        };
    }
};
exports.PrismaManualTestLogRepository = PrismaManualTestLogRepository;
exports.PrismaManualTestLogRepository = PrismaManualTestLogRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaManualTestLogRepository);
//# sourceMappingURL=manual-test-log.repository.js.map