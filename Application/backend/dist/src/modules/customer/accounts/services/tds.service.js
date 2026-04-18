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
exports.TDSService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let TDSService = class TDSService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId, filters) {
        const where = { tenantId };
        if (filters?.section)
            where.section = filters.section;
        if (filters?.financialYear)
            where.financialYear = filters.financialYear;
        if (filters?.quarter)
            where.quarter = filters.quarter;
        if (filters?.status)
            where.status = filters.status;
        return this.prisma.working.tDSRecord.findMany({ where, orderBy: { deductionDate: 'desc' } });
    }
    async markDeposited(tenantId, id, depositDate, challanNumber) {
        const record = await this.prisma.working.tDSRecord.findFirst({ where: { id, tenantId } });
        if (!record)
            throw new common_1.NotFoundException('TDS record not found');
        return this.prisma.working.tDSRecord.update({
            where: { id },
            data: {
                status: 'DEPOSITED',
                depositDate: new Date(depositDate),
                challanNumber,
            },
        });
    }
    async getSummary(tenantId, financialYear) {
        const fy = financialYear || this.getCurrentFY();
        const records = await this.prisma.working.tDSRecord.findMany({
            where: { tenantId, financialYear: fy },
        });
        const bySection = {};
        for (const r of records) {
            if (!bySection[r.section]) {
                bySection[r.section] = { section: r.section, sectionName: r.sectionName || r.section, count: 0, totalDeducted: 0, totalDeposited: 0 };
            }
            bySection[r.section].count++;
            bySection[r.section].totalDeducted += Number(r.tdsAmount);
            if (r.status === 'DEPOSITED')
                bySection[r.section].totalDeposited += Number(r.tdsAmount);
        }
        const byQuarter = {};
        for (const r of records) {
            const q = r.quarter || 'Unknown';
            if (!byQuarter[q])
                byQuarter[q] = { quarter: q, count: 0, total: 0, deposited: 0 };
            byQuarter[q].count++;
            byQuarter[q].total += Number(r.tdsAmount);
            if (r.status === 'DEPOSITED')
                byQuarter[q].deposited += Number(r.tdsAmount);
        }
        return {
            financialYear: fy,
            totalRecords: records.length,
            totalDeducted: Math.round(records.reduce((s, r) => s + Number(r.tdsAmount), 0) * 100) / 100,
            totalDeposited: Math.round(records.filter((r) => r.status === 'DEPOSITED').reduce((s, r) => s + Number(r.tdsAmount), 0) * 100) / 100,
            pendingDeposit: records.filter((r) => r.status === 'DEDUCTED').length,
            bySection: Object.values(bySection),
            byQuarter: Object.values(byQuarter),
        };
    }
    getCurrentFY() {
        const now = new Date();
        const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
        return `${year}-${(year + 1).toString().slice(2)}`;
    }
};
exports.TDSService = TDSService;
exports.TDSService = TDSService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TDSService);
//# sourceMappingURL=tds.service.js.map