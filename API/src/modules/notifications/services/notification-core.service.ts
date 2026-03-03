import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class NotificationCoreService {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: {
    category: string;
    title: string;
    message: string;
    recipientId: string;
    senderId?: string;
    priority?: string;
    channel?: string;
    entityType?: string;
    entityId?: string;
    data?: any;
    groupKey?: string;
  }) {
    // Check if groupable — merge into existing group
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
        category: params.category as any,
        title: params.title,
        message: params.message,
        recipientId: params.recipientId,
        senderId: params.senderId,
        priority: (params.priority as any) || 'MEDIUM',
        channel: (params.channel as any) || 'IN_APP',
        entityType: params.entityType,
        entityId: params.entityId,
        data: params.data,
        groupKey: params.groupKey,
      },
    });
  }

  async markRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, recipientId: userId, isActive: true },
    });
    if (!notification) throw new NotFoundException('Notification not found');

    return this.prisma.notification.update({
      where: { id },
      data: { status: 'READ', readAt: new Date() },
    });
  }

  async markAllRead(userId: string, category?: string) {
    const where: any = {
      recipientId: userId,
      status: 'UNREAD',
      isActive: true,
    };
    if (category) where.category = category;

    const result = await this.prisma.notification.updateMany({
      where,
      data: { status: 'READ', readAt: new Date() },
    });
    return { updated: result.count };
  }

  async dismiss(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, recipientId: userId, isActive: true },
    });
    if (!notification) throw new NotFoundException('Notification not found');

    return this.prisma.notification.update({
      where: { id },
      data: { status: 'DISMISSED', dismissedAt: new Date() },
    });
  }

  async bulkMarkRead(ids: string[], userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { id: { in: ids }, recipientId: userId, isActive: true },
      data: { status: 'READ', readAt: new Date() },
    });
    return { updated: result.count };
  }

  async bulkDismiss(ids: string[], userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { id: { in: ids }, recipientId: userId, isActive: true },
      data: { status: 'DISMISSED', dismissedAt: new Date() },
    });
    return { dismissed: result.count };
  }

  async getNotifications(userId: string, params: {
    page?: number; limit?: number; category?: string;
    status?: string; priority?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { recipientId: userId, isActive: true };
    if (params.category) where.category = params.category;
    if (params.status) where.status = params.status;
    if (params.priority) where.priority = params.priority;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, recipientId: userId, isActive: true },
      include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  async getUnreadCount(userId: string) {
    const total = await this.prisma.notification.count({
      where: { recipientId: userId, status: 'UNREAD', isActive: true },
    });

    const byCategory = await this.prisma.notification.groupBy({
      by: ['category'],
      where: { recipientId: userId, status: 'UNREAD', isActive: true },
      _count: true,
    });

    const categories: Record<string, number> = {};
    for (const item of byCategory) {
      categories[item.category] = item._count;
    }

    return { total, byCategory: categories };
  }

  async getStats(userId: string) {
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
}
