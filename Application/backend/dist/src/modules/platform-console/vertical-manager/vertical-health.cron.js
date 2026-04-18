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
var VerticalHealthCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerticalHealthCron = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const platform_console_prisma_service_1 = require("../prisma/platform-console-prisma.service");
const vertical_manager_service_1 = require("./vertical-manager.service");
let VerticalHealthCron = VerticalHealthCron_1 = class VerticalHealthCron {
    constructor(db, verticalManagerService) {
        this.db = db;
        this.verticalManagerService = verticalManagerService;
        this.logger = new common_1.Logger(VerticalHealthCron_1.name);
    }
    async handleHealthCheck() {
        try {
            const verticals = await this.db.verticalRegistry.findMany({
                where: { status: 'ACTIVE' },
            });
            for (const vertical of verticals) {
                try {
                    await this.verticalManagerService.checkVerticalHealth(vertical.code);
                }
                catch (error) {
                    this.logger.error(`Health check failed for ${vertical.code}`, error.stack);
                }
            }
            this.logger.log(`Health check completed for ${verticals.length} active verticals`);
        }
        catch (error) {
            this.logger.error('Vertical health check cron failed', error.stack);
        }
    }
    async handleWeeklyAudit() {
        try {
            const verticals = await this.db.verticalRegistry.findMany();
            for (const vertical of verticals) {
                try {
                    await this.verticalManagerService.runVerticalAudit(vertical.code);
                }
                catch (error) {
                    this.logger.error(`Weekly audit failed for ${vertical.code}`, error.stack);
                }
            }
            this.logger.log(`Weekly audit completed for ${verticals.length} verticals`);
        }
        catch (error) {
            this.logger.error('Weekly vertical audit cron failed', error.stack);
        }
    }
};
exports.VerticalHealthCron = VerticalHealthCron;
__decorate([
    (0, schedule_1.Cron)('*/30 * * * *', { name: 'vertical-health-check', timeZone: 'Asia/Kolkata' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VerticalHealthCron.prototype, "handleHealthCheck", null);
__decorate([
    (0, schedule_1.Cron)('30 1 * * 0', { name: 'weekly-vertical-audit', timeZone: 'Asia/Kolkata' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VerticalHealthCron.prototype, "handleWeeklyAudit", null);
exports.VerticalHealthCron = VerticalHealthCron = VerticalHealthCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [platform_console_prisma_service_1.PlatformConsolePrismaService,
        vertical_manager_service_1.VerticalManagerService])
], VerticalHealthCron);
//# sourceMappingURL=vertical-health.cron.js.map