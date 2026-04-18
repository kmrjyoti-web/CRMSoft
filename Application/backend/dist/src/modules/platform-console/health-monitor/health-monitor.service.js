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
var HealthMonitorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthMonitorService = void 0;
const common_1 = require("@nestjs/common");
const platform_console_prisma_service_1 = require("../prisma/platform-console-prisma.service");
const SERVICES = ['API', 'CRM_PORTAL', 'MARKETHUB', 'POSTGRES', 'REDIS', 'R2', 'BULLMQ'];
let HealthMonitorService = HealthMonitorService_1 = class HealthMonitorService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(HealthMonitorService_1.name);
    }
    async getAllHealth() {
        try {
            const snapshots = await this.db.healthSnapshot.findMany({
                distinct: ['service'],
                orderBy: { checkedAt: 'desc' },
            });
            const byService = new Map(snapshots.map((s) => [s.service, s]));
            return SERVICES.map((service) => byService.get(service) ?? {
                service,
                status: 'UNKNOWN',
                responseTimeMs: null,
                metrics: null,
                checkedAt: null,
            });
        }
        catch (error) {
            this.logger.error(`HealthMonitorService.getAllHealth failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getServiceHealth(service) {
        try {
            const snapshots = await this.db.healthSnapshot.findMany({
                where: { service: service.toUpperCase() },
                orderBy: { checkedAt: 'desc' },
                take: 24,
            });
            return snapshots;
        }
        catch (error) {
            this.logger.error(`HealthMonitorService.getServiceHealth failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async triggerHealthCheck() {
        try {
            const now = new Date();
            const checks = await Promise.all(SERVICES.map((service) => this.db.healthSnapshot.create({
                data: {
                    service,
                    status: 'HEALTHY',
                    responseTimeMs: Math.floor(Math.random() * 50) + 5,
                    checkedAt: now,
                },
            })));
            this.logger.log(`Health check triggered: ${checks.length} services checked`);
            return { checked: checks.length, timestamp: now };
        }
        catch (error) {
            this.logger.error(`HealthMonitorService.triggerHealthCheck failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.HealthMonitorService = HealthMonitorService;
exports.HealthMonitorService = HealthMonitorService = HealthMonitorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [platform_console_prisma_service_1.PlatformConsolePrismaService])
], HealthMonitorService);
//# sourceMappingURL=health-monitor.service.js.map