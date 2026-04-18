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
var DbMaintenanceCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbMaintenanceCron = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const db_maintenance_service_1 = require("./db-maintenance.service");
let DbMaintenanceCron = DbMaintenanceCron_1 = class DbMaintenanceCron {
    constructor(maintenance) {
        this.maintenance = maintenance;
        this.logger = new common_1.Logger(DbMaintenanceCron_1.name);
    }
    async nightlyMaintenance() {
        this.logger.log('[CRON] Nightly maintenance started');
        try {
            const [vacuumResult, devLogs, sessions] = await Promise.allSettled([
                this.maintenance.runVacuum(),
                this.maintenance.cleanupDevLogs(),
                this.maintenance.cleanupExpiredSessions(),
            ]);
            this.logger.log(`[CRON] Nightly done — vacuum=${this.statusOf(vacuumResult)} devLogs=${this.countOf(devLogs)} sessions=${this.countOf(sessions)}`);
        }
        catch (err) {
            this.logger.error(`[CRON] Nightly maintenance failed: ${err.message}`);
        }
    }
    async weeklyDeepVacuum() {
        this.logger.log('[CRON] Weekly deep vacuum started');
        try {
            const result = await this.maintenance.runVacuum(undefined, true);
            this.logger.log(`[CRON] Weekly vacuum FULL done in ${result.duration}ms — success=${result.success}`);
        }
        catch (err) {
            this.logger.error(`[CRON] Weekly vacuum failed: ${err.message}`);
        }
    }
    async monthlyAuditCleanup() {
        this.logger.log('[CRON] Monthly audit cleanup started');
        try {
            const results = await this.maintenance.runAllCleanup();
            const summary = results.map((r) => `${r.type}=${r.deleted}`).join(' ');
            this.logger.log(`[CRON] Monthly cleanup done — ${summary}`);
        }
        catch (err) {
            this.logger.error(`[CRON] Monthly cleanup failed: ${err.message}`);
        }
    }
    statusOf(result) {
        return result.status === 'fulfilled' ? (result.value?.success ? 'ok' : 'failed') : 'error';
    }
    countOf(result) {
        return result.status === 'fulfilled' ? (result.value?.deleted ?? 0) : -1;
    }
};
exports.DbMaintenanceCron = DbMaintenanceCron;
__decorate([
    (0, schedule_1.Cron)('0 2 * * *', { timeZone: 'Asia/Kolkata' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DbMaintenanceCron.prototype, "nightlyMaintenance", null);
__decorate([
    (0, schedule_1.Cron)('0 3 * * 0', { timeZone: 'Asia/Kolkata' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DbMaintenanceCron.prototype, "weeklyDeepVacuum", null);
__decorate([
    (0, schedule_1.Cron)('0 4 1 * *', { timeZone: 'Asia/Kolkata' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DbMaintenanceCron.prototype, "monthlyAuditCleanup", null);
exports.DbMaintenanceCron = DbMaintenanceCron = DbMaintenanceCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_maintenance_service_1.DbMaintenanceService])
], DbMaintenanceCron);
//# sourceMappingURL=db-maintenance.cron.js.map