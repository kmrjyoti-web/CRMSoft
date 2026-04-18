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
exports.TestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let TestsService = class TestsService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async collectTestResults(partnerId, result) {
        const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
        if (!partner)
            throw new common_1.NotFoundException('Partner not found');
        const passRate = result.totalTests > 0 ? (result.passed / result.totalTests) * 100 : 0;
        const log = await this.prisma.partnerTestLog.create({
            data: {
                partnerId,
                ...result,
                passRate,
                warnings: result.warnings ?? 0,
                startedAt: result.startedAt ?? new Date(),
                completedAt: result.completedAt ?? new Date(),
            },
        });
        await this.audit.log({
            partnerId,
            action: 'TEST_RESULTS_COLLECTED',
            performedBy: result.triggeredBy || 'system',
            performedByRole: 'MASTER_ADMIN',
            details: { testType: result.testType, passRate, totalTests: result.totalTests },
        });
        return log;
    }
    async triggerPartnerTest(partnerId, testType) {
        const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
        if (!partner)
            throw new common_1.NotFoundException('Partner not found');
        const log = await this.prisma.partnerTestLog.create({
            data: {
                partnerId,
                testType,
                totalTests: 0,
                passed: 0,
                failed: 0,
                warnings: 0,
                triggeredBy: 'admin',
                startedAt: new Date(),
            },
        });
        await this.audit.log({
            partnerId,
            action: 'TEST_TRIGGERED',
            performedBy: 'admin',
            performedByRole: 'MASTER_ADMIN',
            details: { testType },
        });
        return {
            triggered: true,
            logId: log.id,
            testType,
            message: `${testType} test triggered for partner ${partner.partnerCode}`,
        };
    }
    async getPartnerTests(partnerId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.partnerTestLog.findMany({ where: { partnerId }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
            this.prisma.partnerTestLog.count({ where: { partnerId } }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async getTestDashboard(partnerId) {
        const where = partnerId ? { partnerId } : {};
        const [total, recentLogs] = await Promise.all([
            this.prisma.partnerTestLog.count({ where }),
            this.prisma.partnerTestLog.findMany({ where, take: 10, orderBy: { createdAt: 'desc' } }),
        ]);
        const avgPassRate = recentLogs.length > 0
            ? recentLogs.reduce((sum, l) => sum + (l.passRate || 0), 0) / recentLogs.length
            : 0;
        return { totalRuns: total, avgPassRate: Math.round(avgPassRate * 10) / 10, recentLogs };
    }
};
exports.TestsService = TestsService;
exports.TestsService = TestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], TestsService);
//# sourceMappingURL=tests.service.js.map