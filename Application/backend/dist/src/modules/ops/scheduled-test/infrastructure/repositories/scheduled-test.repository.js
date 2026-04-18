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
exports.PrismaScheduledTestRepository = exports.SCHEDULED_TEST_REPOSITORY = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
exports.SCHEDULED_TEST_REPOSITORY = Symbol('SCHEDULED_TEST_REPOSITORY');
let PrismaScheduledTestRepository = class PrismaScheduledTestRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.platform.scheduledTest.create({ data: data });
    }
    async findById(id) {
        return this.prisma.platform.scheduledTest.findFirst({
            where: { id, isDeleted: false },
            include: { runs: { orderBy: { startedAt: 'desc' }, take: 10 } },
        });
    }
    async findByTenantId(tenantId, filters = {}) {
        const { isActive, page = 1, limit = 20 } = filters;
        const where = { tenantId, isDeleted: false };
        if (isActive !== undefined)
            where.isActive = isActive;
        const [data, total] = await Promise.all([
            this.prisma.platform.scheduledTest.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: { runs: { orderBy: { startedAt: 'desc' }, take: 1 } },
            }),
            this.prisma.platform.scheduledTest.count({ where }),
        ]);
        return { data, total };
    }
    async findDue() {
        return this.prisma.platform.scheduledTest.findMany({
            where: {
                isActive: true,
                isDeleted: false,
                nextRunAt: { lte: new Date() },
            },
        });
    }
    async update(id, data) {
        return this.prisma.platform.scheduledTest.update({
            where: { id },
            data: data,
        });
    }
    async softDelete(id) {
        await this.prisma.platform.scheduledTest.update({
            where: { id },
            data: { isDeleted: true, isActive: false },
        });
    }
};
exports.PrismaScheduledTestRepository = PrismaScheduledTestRepository;
exports.PrismaScheduledTestRepository = PrismaScheduledTestRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaScheduledTestRepository);
//# sourceMappingURL=scheduled-test.repository.js.map