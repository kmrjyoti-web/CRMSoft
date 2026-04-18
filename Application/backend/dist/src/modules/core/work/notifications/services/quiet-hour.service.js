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
var QuietHourService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuietHourService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let QuietHourService = QuietHourService_1 = class QuietHourService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(QuietHourService_1.name);
    }
    async createConfig(data, tenantId = '') {
        return this.prisma.quietHourConfig.create({
            data: {
                tenantId,
                userId: data.userId || null,
                name: data.name,
                startTime: data.startTime,
                endTime: data.endTime,
                timezone: data.timezone || 'Asia/Kolkata',
                daysOfWeek: data.daysOfWeek,
                allowUrgent: data.allowUrgent ?? true,
            },
        });
    }
    async updateConfig(id, data) {
        const existing = await this.prisma.quietHourConfig.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException(`QuietHourConfig ${id} not found`);
        return this.prisma.quietHourConfig.update({
            where: { id },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.startTime !== undefined && { startTime: data.startTime }),
                ...(data.endTime !== undefined && { endTime: data.endTime }),
                ...(data.timezone !== undefined && { timezone: data.timezone }),
                ...(data.daysOfWeek !== undefined && { daysOfWeek: data.daysOfWeek }),
                ...(data.allowUrgent !== undefined && { allowUrgent: data.allowUrgent }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
            },
        });
    }
    async deleteConfig(id) {
        const existing = await this.prisma.quietHourConfig.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException(`QuietHourConfig ${id} not found`);
        return this.prisma.quietHourConfig.delete({ where: { id } });
    }
    async listConfigs(tenantId = '') {
        return this.prisma.quietHourConfig.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getConfigsForUser(userId, tenantId = '') {
        return this.prisma.quietHourConfig.findMany({
            where: {
                tenantId,
                isActive: true,
                OR: [
                    { userId },
                    { userId: null },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async isInQuietHours(userId, tenantId = '', priority) {
        const configs = await this.getConfigsForUser(userId, tenantId);
        if (configs.length === 0)
            return false;
        const userConfigs = configs.filter((c) => c.userId === userId);
        const globalConfigs = configs.filter((c) => c.userId === null);
        const orderedConfigs = [...userConfigs, ...globalConfigs];
        for (const config of orderedConfigs) {
            if (this.isTimeInWindow(config)) {
                if (config.allowUrgent && (priority === 'URGENT' || priority === 'CRITICAL')) {
                    return false;
                }
                return true;
            }
        }
        return false;
    }
    isTimeInWindow(config) {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: config.timezone,
            hour: 'numeric',
            minute: 'numeric',
            hour12: false,
            weekday: 'short',
        });
        const parts = formatter.formatToParts(now);
        const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
        const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
        const dayFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: config.timezone,
            weekday: 'long',
        });
        const dayName = dayFormatter.format(now);
        const dayMap = {
            Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
            Thursday: 4, Friday: 5, Saturday: 6,
        };
        const currentDay = dayMap[dayName] ?? 0;
        const daysOfWeek = config.daysOfWeek;
        if (!daysOfWeek.includes(currentDay))
            return false;
        const [startH, startM] = config.startTime.split(':').map(Number);
        const [endH, endM] = config.endTime.split(':').map(Number);
        const currentMinutes = hour * 60 + minute;
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        if (startMinutes <= endMinutes) {
            return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
        }
        return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
};
exports.QuietHourService = QuietHourService;
exports.QuietHourService = QuietHourService = QuietHourService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuietHourService);
//# sourceMappingURL=quiet-hour.service.js.map