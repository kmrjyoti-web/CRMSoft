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
exports.PrismaTestGroupRepository = exports.TEST_GROUP_REPOSITORY = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
exports.TEST_GROUP_REPOSITORY = Symbol('TEST_GROUP_REPOSITORY');
let PrismaTestGroupRepository = class PrismaTestGroupRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.platform.testGroup.create({ data: data });
    }
    async findById(id) {
        return this.prisma.platform.testGroup.findFirst({ where: { id, isDeleted: false } });
    }
    async findByTenantId(tenantId, filters = {}) {
        const { status, module } = filters;
        return this.prisma.platform.testGroup.findMany({
            where: {
                tenantId,
                isDeleted: false,
                ...(status ? { status: status } : {}),
                ...(module ? { modules: { has: module } } : {}),
            },
            orderBy: [{ isSystem: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async update(id, data) {
        return this.prisma.platform.testGroup.update({ where: { id }, data });
    }
    async softDelete(id) {
        return this.prisma.platform.testGroup.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
    async findExecution(executionId) {
        return this.prisma.platform.testGroupExecution.findUnique({ where: { id: executionId } });
    }
    async listExecutions(testGroupId) {
        return this.prisma.platform.testGroupExecution.findMany({
            where: { testGroupId },
            orderBy: { startedAt: 'desc' },
            take: 20,
        });
    }
};
exports.PrismaTestGroupRepository = PrismaTestGroupRepository;
exports.PrismaTestGroupRepository = PrismaTestGroupRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaTestGroupRepository);
//# sourceMappingURL=test-group.repository.js.map