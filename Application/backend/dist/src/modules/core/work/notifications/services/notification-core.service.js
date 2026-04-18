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
exports.NotificationCoreService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let NotificationCoreService = class NotificationCoreService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(params) {
        if (params.groupKey) {
            const existing = await this.prisma.notification.findFirst({
                where: {
                    recipientId: params.recipientId,
                    groupKey: params.groupKey,
                    status: 'UNREAD',
                    isActive: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            if (existing) {
                return this.prisma.notification.update({
                    where: { id: existing.id },
                    data: {
                        title: params.title,
                        message: params.message,
                        data: params.data,
                        groupCount: { increment: 1 },
                        isGrouped: true,
                    },
                });
            }
        }
        return this.prisma.notification.create({
            data: {
                category: params.category,
                title: params.title,
                message: params.message,
                recipientId: params.recipientId,
                senderId: params.senderId,
                priority: params.priority || 'MEDIUM',
                channel: params.channel || 'IN_APP',
                entityType: params.entityType,
                entityId: params.entityId,
                data: params.data,
                groupKey: params.groupKey,
            },
        });
    }
    async markRead(id, userId) {
        const notification = await this.prisma.notification.findFirst({
            where: { id, recipientId: userId, isActive: true },
        });
        if (!notification)
            throw new common_1.NotFoundException('Notification not found');
        return this.prisma.notification.update({
            where: { id },
            data: { status: 'READ', readAt: new Date() },
        });
    }
    async markAllRead(userId, category) {
        const where = {
            recipientId: userId,
            status: 'UNREAD',
            isActive: true,
        };
        if (category)
            where.category = category;
        const result = await this.prisma.notification.updateMany({
            where,
            data: { status: 'READ', readAt: new Date() },
        });
        return { updated: result.count };
    }
    async dismiss(id, userId) {
        const notification = await this.prisma.notification.findFirst({
            where: { id, recipientId: userId, isActive: true },
        });
        if (!notification)
            throw new common_1.NotFoundException('Notification not found');
        return this.prisma.notification.update({
            where: { id },
            data: { status: 'DISMISSED', dismissedAt: new Date() },
        });
    }
    async bulkMarkRead(ids, userId) {
        const result = await this.prisma.notification.updateMany({
            where: { id: { in: ids }, recipientId: userId, isActive: true },
            data: { status: 'READ', readAt: new Date() },
        });
        return { updated: result.count };
    }
    async bulkDismiss(ids, userId) {
        const result = await this.prisma.notification.updateMany({
            where: { id: { in: ids }, recipientId: userId, isActive: true },
            data: { status: 'DISMISSED', dismissedAt: new Date() },
        });
        return { dismissed: result.count };
    }
    async getNotifications(userId, params) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;
        const where = { recipientId: userId, isActive: true };
        if (params.category)
            where.category = params.category;
        if (params.status)
            where.status = params.status;
        if (params.priority)
            where.priority = params.priority;
        const [data, total] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.notification.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getById(id, userId) {
        const notification = await this.prisma.notification.findFirst({
            where: { id, recipientId: userId, isActive: true },
        });
        if (!notification)
            throw new common_1.NotFoundException('Notification not found');
        return notification;
    }
    async getUnreadCount(userId) {
        const total = await this.prisma.notification.count({
            where: { recipientId: userId, status: 'UNREAD', isActive: true },
        });
        const byCategory = await this.prisma.notification.groupBy({
            by: ['category'],
            where: { recipientId: userId, status: 'UNREAD', isActive: true },
            _count: true,
        });
        const categories = {};
        for (const item of byCategory) {
            categories[item.category] = item._count;
        }
        return { total, byCategory: categories };
    }
    async getStats(userId) {
        const [total, unread, read, dismissed] = await Promise.all([
            this.prisma.notification.count({ where: { recipientId: userId, isActive: true } }),
            this.prisma.notification.count({ where: { recipientId: userId, status: 'UNREAD', isActive: true } }),
            this.prisma.notification.count({ where: { recipientId: userId, status: 'READ', isActive: true } }),
            this.prisma.notification.count({ where: { recipientId: userId, status: 'DISMISSED', isActive: true } }),
        ]);
        const byCategory = await this.prisma.notification.groupBy({
            by: ['category'],
            where: { recipientId: userId, isActive: true },
            _count: true,
        });
        const byPriority = await this.prisma.notification.groupBy({
            by: ['priority'],
            where: { recipientId: userId, isActive: true },
            _count: true,
        });
        return {
            total, unread, read, dismissed,
            byCategory: byCategory.map(c => ({ category: c.category, count: c._count })),
            byPriority: byPriority.map(p => ({ priority: p.priority, count: p._count })),
        };
    }
};
exports.NotificationCoreService = NotificationCoreService;
exports.NotificationCoreService = NotificationCoreService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationCoreService);
//# sourceMappingURL=notification-core.service.js.map