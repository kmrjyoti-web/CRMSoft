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
var HealthSnapshotCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthSnapshotCron = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const platform_console_prisma_service_1 = require("../prisma/platform-console-prisma.service");
const security_service_1 = require("./security.service");
let HealthSnapshotCron = HealthSnapshotCron_1 = class HealthSnapshotCron {
    constructor(db, securityService) {
        this.db = db;
        this.securityService = securityService;
        this.logger = new common_1.Logger(HealthSnapshotCron_1.name);
    }
    async captureSnapshots() {
        try {
            const snapshots = await this.securityService.captureHealthSnapshot();
            for (const snapshot of snapshots) {
                if (snapshot.status === 'DOWN') {
                    await this.securityService.createIncident({
                        title: `Service DOWN: ${snapshot.service}`,
                        severity: 'P1',
                        description: `Service ${snapshot.service} is reporting DOWN status. Automatic incident created by health monitor.`,
                        affectedService: snapshot.service,
                    });
                    this.logger.warn(`P1 incident created for DOWN service: ${snapshot.service}`);
                }
                if (snapshot.status === 'DEGRADED') {
                    await this.db.alertHistory.create({
                        data: {
                            severity: 'WARNING',
                            title: `Service DEGRADED: ${snapshot.service}`,
                            message: `Service ${snapshot.service} is experiencing degraded performance. Response time: ${snapshot.responseTimeMs}ms`,
                            channel: 'SYSTEM',
                            delivered: true,
                            createdAt: new Date(),
                        },
                    });
                    this.logger.warn(`Alert created for DEGRADED service: ${snapshot.service}`);
                }
            }
            this.logger.log(`Health snapshot cron completed — ${snapshots.length} services checked`);
        }
        catch (error) {
            this.logger.error('Health snapshot cron failed', error?.stack || error);
        }
    }
    async cleanupOldSnapshots() {
        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const result = await this.db.healthSnapshot.deleteMany({
                where: { checkedAt: { lt: sevenDaysAgo } },
            });
            this.logger.log(`Snapshot cleanup: deleted ${result.count} records older than 7 days`);
        }
        catch (error) {
            this.logger.error('Snapshot cleanup cron failed', error?.stack || error);
        }
    }
};
exports.HealthSnapshotCron = HealthSnapshotCron;
__decorate([
    (0, schedule_1.Cron)('*/5 * * * *', { name: 'health-snapshot', timeZone: 'Asia/Kolkata' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthSnapshotCron.prototype, "captureSnapshots", null);
__decorate([
    (0, schedule_1.Cron)('30 18 * * *', { name: 'snapshot-cleanup', timeZone: 'Asia/Kolkata' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthSnapshotCron.prototype, "cleanupOldSnapshots", null);
exports.HealthSnapshotCron = HealthSnapshotCron = HealthSnapshotCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [platform_console_prisma_service_1.PlatformConsolePrismaService,
        security_service_1.SecurityService])
], HealthSnapshotCron);
//# sourceMappingURL=health-snapshot.cron.js.map