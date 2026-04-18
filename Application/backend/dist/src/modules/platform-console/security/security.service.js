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
var SecurityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityService = void 0;
const common_1 = require("@nestjs/common");
const platform_console_prisma_service_1 = require("../prisma/platform-console-prisma.service");
const security_errors_1 = require("./security.errors");
const MONITORED_SERVICES = [
    'API',
    'POSTGRES',
    'REDIS',
    'R2_STORAGE',
    'BULLMQ',
    'CRM_PORTAL',
    'MARKETHUB',
];
let SecurityService = SecurityService_1 = class SecurityService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(SecurityService_1.name);
    }
    async captureHealthSnapshot() {
        try {
            const degradedIndex = Math.floor(Math.random() * MONITORED_SERVICES.length);
            const snapshots = [];
            for (let i = 0; i < MONITORED_SERVICES.length; i++) {
                const service = MONITORED_SERVICES[i];
                const status = i === degradedIndex ? 'DEGRADED' : 'HEALTHY';
                const responseTimeMs = Math.floor(Math.random() * 46) + 5;
                const snapshot = await this.db.healthSnapshot.create({
                    data: {
                        service,
                        status,
                        responseTimeMs,
                        metrics: {
                            cpu: Math.round(Math.random() * 60 + 10),
                            memory: Math.round(Math.random() * 40 + 30),
                            uptime: Math.round(Math.random() * 86400),
                        },
                        checkedAt: new Date(),
                    },
                });
                snapshots.push(snapshot);
            }
            this.logger.log(`Captured ${snapshots.length} health snapshots`);
            return snapshots;
        }
        catch (error) {
            this.logger.error('Failed to capture health snapshots', error?.stack || error);
            const err = security_errors_1.SECURITY_ERRORS.SNAPSHOT_FAILED;
            throw new common_1.HttpException(err.message, err.statusCode);
        }
    }
    async getSnapshots(params) {
        try {
            const page = params.page || 1;
            const limit = params.limit || 20;
            const skip = (page - 1) * limit;
            const where = {};
            if (params.service) {
                where.service = params.service;
            }
            const [data, total] = await Promise.all([
                this.db.healthSnapshot.findMany({
                    where,
                    orderBy: { checkedAt: 'desc' },
                    skip,
                    take: limit,
                }),
                this.db.healthSnapshot.count({ where }),
            ]);
            return { data, total };
        }
        catch (error) {
            this.logger.error('Failed to get snapshots', error?.stack || error);
            throw error;
        }
    }
    async getLatestSnapshots() {
        try {
            const snapshots = [];
            for (const service of MONITORED_SERVICES) {
                const snapshot = await this.db.healthSnapshot.findFirst({
                    where: { service },
                    orderBy: { checkedAt: 'desc' },
                });
                if (snapshot) {
                    snapshots.push(snapshot);
                }
            }
            return snapshots;
        }
        catch (error) {
            this.logger.error('Failed to get latest snapshots', error?.stack || error);
            throw error;
        }
    }
    async getIncidents(params) {
        try {
            const page = params.page || 1;
            const limit = params.limit || 20;
            const skip = (page - 1) * limit;
            const where = {};
            if (params.status)
                where.status = params.status;
            if (params.severity)
                where.severity = params.severity;
            const [data, total] = await Promise.all([
                this.db.incidentLog.findMany({
                    where,
                    orderBy: { startedAt: 'desc' },
                    skip,
                    take: limit,
                }),
                this.db.incidentLog.count({ where }),
            ]);
            return { data, total };
        }
        catch (error) {
            this.logger.error('Failed to get incidents', error?.stack || error);
            throw error;
        }
    }
    async createIncident(dto) {
        try {
            const incident = await this.db.incidentLog.create({
                data: {
                    title: dto.title,
                    severity: dto.severity,
                    description: dto.description,
                    affectedService: dto.affectedService,
                    status: 'OPEN',
                    startedAt: new Date(),
                },
            });
            await this.db.notificationLog.create({
                data: {
                    type: 'INCIDENT',
                    channel: 'EMAIL',
                    recipient: 'dev-team',
                    subject: dto.title,
                    body: dto.description,
                    status: 'SENT',
                    sentAt: new Date(),
                },
            });
            this.logger.log(`Created incident: ${incident.id} — ${dto.title}`);
            return incident;
        }
        catch (error) {
            this.logger.error('Failed to create incident', error?.stack || error);
            throw error;
        }
    }
    async getIncident(id) {
        try {
            const incident = await this.db.incidentLog.findUnique({ where: { id } });
            if (!incident) {
                const err = security_errors_1.SECURITY_ERRORS.INCIDENT_NOT_FOUND;
                throw new common_1.HttpException(err.message, err.statusCode);
            }
            return incident;
        }
        catch (error) {
            this.logger.error(`Failed to get incident ${id}`, error?.stack || error);
            throw error;
        }
    }
    async updateIncident(id, data) {
        try {
            const updateData = { ...data };
            if (data.status === 'RESOLVED') {
                updateData.resolvedAt = new Date();
            }
            const incident = await this.db.incidentLog.update({
                where: { id },
                data: updateData,
            });
            this.logger.log(`Updated incident ${id}: status=${data.status || 'unchanged'}`);
            return incident;
        }
        catch (error) {
            this.logger.error(`Failed to update incident ${id}`, error?.stack || error);
            throw error;
        }
    }
    async addPostmortem(id, postmortem) {
        try {
            const incident = await this.db.incidentLog.update({
                where: { id },
                data: { postmortem },
            });
            this.logger.log(`Added postmortem to incident ${id}`);
            return incident;
        }
        catch (error) {
            this.logger.error(`Failed to add postmortem to incident ${id}`, error?.stack || error);
            throw error;
        }
    }
    async getDRPlans() {
        try {
            return await this.db.dRPlan.findMany({ orderBy: { service: 'asc' } });
        }
        catch (error) {
            this.logger.error('Failed to get DR plans', error?.stack || error);
            throw error;
        }
    }
    async getDRPlan(service) {
        try {
            const plan = await this.db.dRPlan.findUnique({ where: { service } });
            if (!plan) {
                const err = security_errors_1.SECURITY_ERRORS.DR_PLAN_NOT_FOUND;
                throw new common_1.HttpException(err.message, err.statusCode);
            }
            return plan;
        }
        catch (error) {
            this.logger.error(`Failed to get DR plan for ${service}`, error?.stack || error);
            throw error;
        }
    }
    async updateDRPlan(service, data) {
        try {
            const plan = await this.db.dRPlan.update({
                where: { service },
                data,
            });
            this.logger.log(`Updated DR plan for ${service}`);
            return plan;
        }
        catch (error) {
            this.logger.error(`Failed to update DR plan for ${service}`, error?.stack || error);
            throw error;
        }
    }
    async testDRPlan(service) {
        try {
            const plan = await this.db.dRPlan.update({
                where: { service },
                data: { lastTested: new Date() },
            });
            this.logger.log(`DR plan tested for ${service}`);
            return plan;
        }
        catch (error) {
            this.logger.error(`Failed to test DR plan for ${service}`, error?.stack || error);
            throw error;
        }
    }
    async getNotifications(params) {
        try {
            const page = params.page || 1;
            const limit = params.limit || 20;
            const skip = (page - 1) * limit;
            const [data, total] = await Promise.all([
                this.db.notificationLog.findMany({
                    orderBy: { sentAt: 'desc' },
                    skip,
                    take: limit,
                }),
                this.db.notificationLog.count(),
            ]);
            return { data, total };
        }
        catch (error) {
            this.logger.error('Failed to get notifications', error?.stack || error);
            throw error;
        }
    }
    async getNotificationStats() {
        try {
            const [total, delivered, failed] = await Promise.all([
                this.db.notificationLog.count(),
                this.db.notificationLog.count({ where: { status: 'SENT' } }),
                this.db.notificationLog.count({ where: { status: 'FAILED' } }),
            ]);
            return { total, delivered, failed };
        }
        catch (error) {
            this.logger.error('Failed to get notification stats', error?.stack || error);
            throw error;
        }
    }
};
exports.SecurityService = SecurityService;
exports.SecurityService = SecurityService = SecurityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [platform_console_prisma_service_1.PlatformConsolePrismaService])
], SecurityService);
//# sourceMappingURL=security.service.js.map