import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class PreferenceService {
  constructor(private readonly prisma: PrismaService) {}

  async getPreferences(userId: string) {
    let preference = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preference) {
      preference = await this.prisma.notificationPreference.create({
        data: {
          userId,
          channels: { enabled: ['IN_APP', 'EMAIL'] },
          categories: {},
          digestFrequency: 'REALTIME',
          timezone: 'Asia/Kolkata',
        },
      });
    }

    return preference;
  }

  async updatePreferences(userId: string, data: {
    channels?: any;
    categories?: any;
    quietHoursStart?: string;
    quietHoursEnd?: string;
    digestFrequency?: string;
    timezone?: string;
  }) {
    const updateData: any = {};
    if (data.channels !== undefined) updateData.channels = data.channels;
    if (data.categories !== undefined) updateData.categories = data.categories;
    if (data.quietHoursStart !== undefined) updateData.quietHoursStart = data.quietHoursStart;
    if (data.quietHoursEnd !== undefined) updateData.quietHoursEnd = data.quietHoursEnd;
    if (data.digestFrequency !== undefined) updateData.digestFrequency = data.digestFrequency;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;

    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        channels: data.channels || { enabled: ['IN_APP', 'EMAIL'] },
        categories: data.categories || {},
        digestFrequency: (data.digestFrequency as any) || 'REALTIME',
        timezone: data.timezone || 'Asia/Kolkata',
        quietHoursStart: data.quietHoursStart,
        quietHoursEnd: data.quietHoursEnd,
      },
    });
  }

  async registerPushSubscription(userId: string, data: {
    endpoint: string;
    p256dh?: string;
    auth?: string;
    deviceType?: string;
  }) {
    // Deactivate existing subscription for same endpoint
    await this.prisma.pushSubscription.updateMany({
      where: { userId, endpoint: data.endpoint },
      data: { isActive: false },
    });

    return this.prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        deviceType: data.deviceType,
        isActive: true,
      },
    });
  }

  async unregisterPushSubscription(userId: string, endpoint: string) {
    const result = await this.prisma.pushSubscription.updateMany({
      where: { userId, endpoint, isActive: true },
      data: { isActive: false },
    });

    if (result.count === 0) throw new NotFoundException('Push subscription not found');
    return { unregistered: result.count };
  }

  async getPushSubscriptions(userId: string) {
    return this.prisma.pushSubscription.findMany({
      where: { userId, isActive: true },
    });
  }
}
