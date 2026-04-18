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
exports.PrismaTestEnvRepository = exports.TEST_ENV_REPOSITORY = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
exports.TEST_ENV_REPOSITORY = Symbol('TEST_ENV_REPOSITORY');
let PrismaTestEnvRepository = class PrismaTestEnvRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.platform.testEnvironment.create({ data: data });
    }
    async findById(id) {
        return this.prisma.platform.testEnvironment.findUnique({ where: { id } });
    }
    async findByTenantId(tenantId, filters = {}) {
        const { status, page = 1, limit = 20 } = filters;
        return this.prisma.platform.testEnvironment.findMany({
            where: {
                tenantId,
                ...(status ? { status: status } : {}),
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }
    async countActive(tenantId) {
        return this.prisma.platform.testEnvironment.count({
            where: {
                tenantId,
                status: { in: ['QUEUED', 'CREATING', 'SEEDING', 'READY', 'TESTING'] },
            },
        });
    }
    async update(id, data) {
        return this.prisma.platform.testEnvironment.update({
            where: { id },
            data: data,
        });
    }
    async findExpired() {
        return this.prisma.platform.testEnvironment.findMany({
            where: {
                expiresAt: { lt: new Date() },
                status: { in: ['READY', 'COMPLETED', 'TESTING'] },
            },
        });
    }
};
exports.PrismaTestEnvRepository = PrismaTestEnvRepository;
exports.PrismaTestEnvRepository = PrismaTestEnvRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaTestEnvRepository);
//# sourceMappingURL=test-env.repository.js.map