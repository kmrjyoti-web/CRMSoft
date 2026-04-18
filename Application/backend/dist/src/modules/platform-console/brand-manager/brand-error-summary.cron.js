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
var BrandErrorSummaryCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandErrorSummaryCron = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const platform_console_prisma_service_1 = require("../prisma/platform-console-prisma.service");
let BrandErrorSummaryCron = BrandErrorSummaryCron_1 = class BrandErrorSummaryCron {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(BrandErrorSummaryCron_1.name);
    }
    async aggregateMonthlyErrors() {
        try {
            this.logger.log('Starting monthly brand error summary aggregation');
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const now = new Date();
            const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const errors = await this.db.globalErrorLog.findMany({
                where: {
                    createdAt: { gte: thirtyDaysAgo },
                },
            });
            const brandMap = new Map();
            for (const error of errors) {
                const brandId = error.brandId || 'UNKNOWN';
                if (!brandMap.has(brandId)) {
                    brandMap.set(brandId, []);
                }
                brandMap.get(brandId).push(error);
            }
            for (const [brandId, brandErrors] of brandMap) {
                const totalErrors = brandErrors.length;
                const criticalCount = brandErrors.filter((e) => e.severity === 'CRITICAL').length;
                const resolvedCount = brandErrors.filter((e) => e.resolvedAt !== null).length;
                const moduleCountMap = new Map();
                for (const e of brandErrors) {
                    const mod = e.moduleCode || 'unknown';
                    moduleCountMap.set(mod, (moduleCountMap.get(mod) || 0) + 1);
                }
                const topModules = [...moduleCountMap.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([moduleCode, count]) => ({ moduleCode, count }));
                await this.db.brandErrorSummary.upsert({
                    where: { brandId_period: { brandId, period } },
                    update: {
                        totalErrors,
                        criticalCount,
                        resolvedCount,
                        topModules: topModules,
                        updatedAt: new Date(),
                    },
                    create: {
                        brandId,
                        period,
                        totalErrors,
                        criticalCount,
                        resolvedCount,
                        topModules: topModules,
                    },
                });
            }
            this.logger.log(`Monthly brand error summary completed for ${brandMap.size} brands`);
        }
        catch (error) {
            this.logger.error('Failed to aggregate monthly brand errors', error.stack);
        }
    }
};
exports.BrandErrorSummaryCron = BrandErrorSummaryCron;
__decorate([
    (0, schedule_1.Cron)('30 0 1 * *', { name: 'monthly-brand-error-summary', timeZone: 'Asia/Kolkata' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BrandErrorSummaryCron.prototype, "aggregateMonthlyErrors", null);
exports.BrandErrorSummaryCron = BrandErrorSummaryCron = BrandErrorSummaryCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [platform_console_prisma_service_1.PlatformConsolePrismaService])
], BrandErrorSummaryCron);
//# sourceMappingURL=brand-error-summary.cron.js.map