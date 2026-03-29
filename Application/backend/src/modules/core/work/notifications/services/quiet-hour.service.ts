import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

export interface CreateQuietHourDto {
  userId?: string;
  name: string;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  timezone?: string;
  daysOfWeek: number[]; // 0=Sun, 1=Mon ... 6=Sat
  allowUrgent?: boolean;
}

export interface UpdateQuietHourDto {
  name?: string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  daysOfWeek?: number[];
  allowUrgent?: boolean;
  isActive?: boolean;
}

@Injectable()
export class QuietHourService {
  private readonly logger = new Logger(QuietHourService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Create a quiet hour config (user-specific or global/tenant-wide). */
  async createConfig(data: CreateQuietHourDto, tenantId = '') {
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

  /** Update an existing quiet hour config. */
  async updateConfig(id: string, data: UpdateQuietHourDto) {
    const existing = await this.prisma.quietHourConfig.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`QuietHourConfig ${id} not found`);

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

  /** Delete a quiet hour config. */
  async deleteConfig(id: string) {
    const existing = await this.prisma.quietHourConfig.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`QuietHourConfig ${id} not found`);

    return this.prisma.quietHourConfig.delete({ where: { id } });
  }

  /** List all quiet hour configs for a tenant. */
  async listConfigs(tenantId = '') {
    return this.prisma.quietHourConfig.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Get configs applicable to a specific user (user-specific + global tenant configs). */
  async getConfigsForUser(userId: string, tenantId = '') {
    return this.prisma.quietHourConfig.findMany({
      where: {
        tenantId,
        isActive: true,
        OR: [
          { userId },       // user-specific configs
          { userId: null },  // global/tenant-wide configs
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Check if current time falls within any quiet hour window for the user.
   * Resolution order: user-specific configs first, then global tenant configs.
   * If allowUrgent is true and priority is URGENT or CRITICAL, returns false.
   */
  async isInQuietHours(userId: string, tenantId = '', priority?: string): Promise<boolean> {
    const configs = await this.getConfigsForUser(userId, tenantId);

    if (configs.length === 0) return false;

    // Check user-specific configs first, then global
    const userConfigs = configs.filter((c) => c.userId === userId);
    const globalConfigs = configs.filter((c) => c.userId === null);

    const orderedConfigs = [...userConfigs, ...globalConfigs];

    for (const config of orderedConfigs) {
      if (this.isTimeInWindow(config)) {
        // If allowUrgent is true and priority is URGENT/CRITICAL, do NOT block
        if (config.allowUrgent && (priority === 'URGENT' || priority === 'CRITICAL')) {
          return false;
        }
        return true;
      }
    }

    return false;
  }

  /** Check if the current time falls within a quiet hour config window. */
  private isTimeInWindow(config: {
    startTime: string;
    endTime: string;
    timezone: string;
    daysOfWeek: any;
  }): boolean {
    // Get current time in the config's timezone
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

    // Get day of week (0=Sun ... 6=Sat) in the config timezone
    const dayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: config.timezone,
      weekday: 'long',
    });
    const dayName = dayFormatter.format(now);
    const dayMap: Record<string, number> = {
      Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
      Thursday: 4, Friday: 5, Saturday: 6,
    };
    const currentDay = dayMap[dayName] ?? 0;

    // Check if today is in the allowed days
    const daysOfWeek = config.daysOfWeek as number[];
    if (!daysOfWeek.includes(currentDay)) return false;

    // Parse start/end times
    const [startH, startM] = config.startTime.split(':').map(Number);
    const [endH, endM] = config.endTime.split(':').map(Number);
    const currentMinutes = hour * 60 + minute;
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // Handle same-day and overnight windows
    if (startMinutes <= endMinutes) {
      // Same-day window (e.g., 22:00 - 23:00 or 09:00 - 17:00)
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }
    // Overnight window (e.g., 22:00 - 06:00)
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
}
