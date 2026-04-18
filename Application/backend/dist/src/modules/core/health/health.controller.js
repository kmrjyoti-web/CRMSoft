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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
const os = require("os");
const START_TIME = Date.now();
let HealthController = class HealthController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async health() {
        return {
            status: 'healthy',
            uptime: Math.floor((Date.now() - START_TIME) / 1000),
            version: process.env.APP_VERSION || '1.0.0',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
        };
    }
    async deepHealth() {
        const checks = {};
        let overallStatus = 'healthy';
        const dbChecks = [
            { key: 'workingDb', fn: () => this.prisma.working.$queryRaw `SELECT 1` },
            { key: 'platformDb', fn: () => this.prisma.platform.$queryRaw `SELECT 1` },
        ];
        for (const { key, fn } of dbChecks) {
            const t0 = Date.now();
            try {
                await fn();
                checks[key] = { status: 'up', responseTimeMs: Date.now() - t0 };
            }
            catch {
                checks[key] = { status: 'down', responseTimeMs: Date.now() - t0 };
                overallStatus = 'unhealthy';
            }
        }
        const t0id = Date.now();
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            checks['identityDb'] = { status: 'up', responseTimeMs: Date.now() - t0id };
        }
        catch {
            checks['identityDb'] = { status: 'down', responseTimeMs: Date.now() - t0id };
            overallStatus = 'unhealthy';
        }
        const totalMb = Math.round(os.totalmem() / 1024 / 1024);
        const freeMb = Math.round(os.freemem() / 1024 / 1024);
        const usedMb = totalMb - freeMb;
        const usedPercent = Math.round((usedMb / totalMb) * 100);
        checks['memory'] = {
            status: usedPercent > 90 ? 'warning' : 'ok',
            usedMb,
            totalMb,
            usedPercent,
        };
        if (usedPercent > 90 && overallStatus === 'healthy')
            overallStatus = 'degraded';
        const proc = process.memoryUsage();
        checks['process'] = {
            heapUsedMb: Math.round(proc.heapUsed / 1024 / 1024),
            heapTotalMb: Math.round(proc.heapTotal / 1024 / 1024),
            rssM: Math.round(proc.rss / 1024 / 1024),
        };
        checks['uptime'] = {
            appUptimeSeconds: Math.floor((Date.now() - START_TIME) / 1000),
            systemUptimeSeconds: Math.floor(os.uptime()),
        };
        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            version: process.env.APP_VERSION || '1.0.0',
            checks,
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Quick health check' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "health", null);
__decorate([
    (0, common_1.Get)('deep'),
    (0, swagger_1.ApiOperation)({ summary: 'Deep health check (all subsystems)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "deepHealth", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('Health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HealthController);
//# sourceMappingURL=health.controller.js.map