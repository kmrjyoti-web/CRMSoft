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
var DigestService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigestService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const error_utils_1 = require("../../../../../common/utils/error.utils");
let DigestService = DigestService_1 = class DigestService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DigestService_1.name);
    }
    async processHourlyDigest() {
        await this.processDigest('HOURLY', 60);
    }
    async processDailyDigest() {
        await this.processDigest('DAILY', 1440);
    }
    async processWeeklyDigest() {
        await this.processDigest('WEEKLY', 10080);
    }
    async processDigest(frequency, minutesBack) {
        const since = new Date(Date.now() - minutesBack * 60 * 1000);
        const preferences = await this.prisma.notificationPreference.findMany({
            where: { digestFrequency: frequency, isActive: true },
        });
        for (const pref of preferences) {
            try {
                const unreadCount = await this.prisma.notification.count({
                    where: {
                        recipientId: pref.userId,
                        status: 'UNREAD',
                        isActive: true,
                        createdAt: { gte: since },
                    },
                });
                if (unreadCount === 0)
                    continue;
                const notifications = await this.prisma.notification.findMany({
                    where: {
                        recipientId: pref.userId,
                        status: 'UNREAD',
                        isActive: true,
                        createdAt: { gte: since },
                    },
                    orderBy: { priority: 'desc' },
                    take: 20,
                });
                const byCategory = {};
                for (const n of notifications) {
                    byCategory[n.category] = (byCategory[n.category] || 0) + 1;
                }
                this.logger.log(`${frequency} digest for user ${pref.userId}: ${unreadCount} unread across ${Object.keys(byCategory).length} categories`);
            }
            catch (error) {
                this.logger.error(`Digest failed for user ${pref.userId}: ${(0, error_utils_1.getErrorMessage)(error)}`);
            }
        }
    }
    async regroupNotifications() {
        const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
        const groupable = await this.prisma.notification.groupBy({
            by: ['recipientId', 'groupKey'],
            where: {
                groupKey: { not: null },
                status: 'UNREAD',
                isActive: true,
                createdAt: { gte: thirtyMinAgo },
            },
            _count: true,
            having: { groupKey: { _count: { gt: 1 } } },
        });
        for (const group of groupable) {
            if (!group.groupKey)
                continue;
            const notifications = await this.prisma.notification.findMany({
                where: {
                    recipientId: group.recipientId,
                    groupKey: group.groupKey,
                    status: 'UNREAD',
                    isActive: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            if (notifications.length <= 1)
                continue;
            const [keep, ...rest] = notifications;
            await this.prisma.notification.update({
                where: { id: keep.id },
                data: { isGrouped: true, groupCount: notifications.length },
            });
            if (rest.length > 0) {
                await this.prisma.notification.updateMany({
                    where: { id: { in: rest.map(r => r.id) } },
                    data: { isActive: false },
                });
            }
        }
    }
};
exports.DigestService = DigestService;
exports.DigestService = DigestService = DigestService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DigestService);
//# sourceMappingURL=digest.service.js.map