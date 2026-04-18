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
exports.PrismaTestRunRepository = exports.TEST_RUN_REPOSITORY = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
exports.TEST_RUN_REPOSITORY = Symbol('TEST_RUN_REPOSITORY');
let PrismaTestRunRepository = class PrismaTestRunRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.platform.testRun.create({ data: data });
    }
    async findById(id) {
        return this.prisma.platform.testRun.findUnique({ where: { id } });
    }
    async findByTenantId(tenantId, filters = {}) {
        const { status, page = 1, limit = 20 } = filters;
        return this.prisma.platform.testRun.findMany({
            where: {
                tenantId,
                ...(status ? { status: status } : {}),
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }
    async update(id, data) {
        return this.prisma.platform.testRun.update({
            where: { id },
            data: data,
        });
    }
    async countRunning(tenantId) {
        return this.prisma.platform.testRun.count({
            where: {
                tenantId,
                status: { in: ['QUEUED', 'RUNNING'] },
            },
        });
    }
    async findWithResults(id) {
        return this.prisma.platform.testRun.findUnique({
            where: { id },
            include: { results: { orderBy: { createdAt: 'asc' } } },
        });
    }
};
exports.PrismaTestRunRepository = PrismaTestRunRepository;
exports.PrismaTestRunRepository = PrismaTestRunRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaTestRunRepository);
//# sourceMappingURL=test-run.repository.js.map