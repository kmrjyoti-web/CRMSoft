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
var NotificationCleanupHandler_1, DigestHourlyHandler_1, DigestDailyHandler_1, DigestWeeklyHandler_1, RegroupNotificationsHandler_1, CleanupPushSubscriptionsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupPushSubscriptionsHandler = exports.RegroupNotificationsHandler = exports.DigestWeeklyHandler = exports.DigestDailyHandler = exports.DigestHourlyHandler = exports.NotificationCleanupHandler = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let NotificationCleanupHandler = NotificationCleanupHandler_1 = class NotificationCleanupHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'NOTIFICATION_CLEANUP';
        this.logger = new common_1.Logger(NotificationCleanupHandler_1.name);
    }
    async execute(params) {
        try {
            const days = params.retentionDays ?? 90;
            const cutoff = new Date(Date.now() - days * 86400000);
            const archived = await this.prisma.working.notification.deleteMany({
                where: { status: 'READ', createdAt: { lt: cutoff } },
            });
            const expired = await this.prisma.working.notification.deleteMany({
                where: { createdAt: { lt: new Date(Date.now() - 180 * 86400000) } },
            });
            return { recordsProcessed: archived.count + expired.count };
        }
        catch (error) {
            const err = error;
            this.logger.error(`NotificationCleanupHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.NotificationCleanupHandler = NotificationCleanupHandler;
exports.NotificationCleanupHandler = NotificationCleanupHandler = NotificationCleanupHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationCleanupHandler);
let DigestHourlyHandler = DigestHourlyHandler_1 = class DigestHourlyHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'DIGEST_HOURLY';
        this.logger = new common_1.Logger(DigestHourlyHandler_1.name);
    }
    async execute() {
        try {
            const prefs = await this.prisma.working.notificationPreference.findMany({
                where: { digestFrequency: 'HOURLY' },
            });
            return { recordsProcessed: prefs.length };
        }
        catch (error) {
            const err = error;
            this.logger.error(`DigestHourlyHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.DigestHourlyHandler = DigestHourlyHandler;
exports.DigestHourlyHandler = DigestHourlyHandler = DigestHourlyHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DigestHourlyHandler);
let DigestDailyHandler = DigestDailyHandler_1 = class DigestDailyHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'DIGEST_DAILY';
        this.logger = new common_1.Logger(DigestDailyHandler_1.name);
    }
    async execute() {
        try {
            const prefs = await this.prisma.working.notificationPreference.findMany({
                where: { digestFrequency: 'DAILY' },
            });
            return { recordsProcessed: prefs.length };
        }
        catch (error) {
            const err = error;
            this.logger.error(`DigestDailyHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.DigestDailyHandler = DigestDailyHandler;
exports.DigestDailyHandler = DigestDailyHandler = DigestDailyHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DigestDailyHandler);
let DigestWeeklyHandler = DigestWeeklyHandler_1 = class DigestWeeklyHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'DIGEST_WEEKLY';
        this.logger = new common_1.Logger(DigestWeeklyHandler_1.name);
    }
    async execute() {
        try {
            const prefs = await this.prisma.working.notificationPreference.findMany({
                where: { digestFrequency: 'WEEKLY' },
            });
            return { recordsProcessed: prefs.length };
        }
        catch (error) {
            const err = error;
            this.logger.error(`DigestWeeklyHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.DigestWeeklyHandler = DigestWeeklyHandler;
exports.DigestWeeklyHandler = DigestWeeklyHandler = DigestWeeklyHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DigestWeeklyHandler);
let RegroupNotificationsHandler = RegroupNotificationsHandler_1 = class RegroupNotificationsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'REGROUP_NOTIFICATIONS';
        this.logger = new common_1.Logger(RegroupNotificationsHandler_1.name);
    }
    async execute() {
        try {
            const cutoff = new Date(Date.now() - 30 * 60 * 1000);
            const ungrouped = await this.prisma.working.notification.findMany({
                where: { groupKey: null, createdAt: { gte: cutoff } },
            });
            return { recordsProcessed: ungrouped.length };
        }
        catch (error) {
            const err = error;
            this.logger.error(`RegroupNotificationsHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.RegroupNotificationsHandler = RegroupNotificationsHandler;
exports.RegroupNotificationsHandler = RegroupNotificationsHandler = RegroupNotificationsHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RegroupNotificationsHandler);
let CleanupPushSubscriptionsHandler = CleanupPushSubscriptionsHandler_1 = class CleanupPushSubscriptionsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'CLEANUP_PUSH_SUBSCRIPTIONS';
        this.logger = new common_1.Logger(CleanupPushSubscriptionsHandler_1.name);
    }
    async execute() {
        try {
            const cutoff = new Date(Date.now() - 60 * 86400000);
            const result = await this.prisma.working.pushSubscription.deleteMany({
                where: { isActive: false, updatedAt: { lt: cutoff } },
            });
            return { recordsProcessed: result.count };
        }
        catch (error) {
            const err = error;
            this.logger.error(`CleanupPushSubscriptionsHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.CleanupPushSubscriptionsHandler = CleanupPushSubscriptionsHandler;
exports.CleanupPushSubscriptionsHandler = CleanupPushSubscriptionsHandler = CleanupPushSubscriptionsHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CleanupPushSubscriptionsHandler);
//# sourceMappingURL=notification-handlers.js.map