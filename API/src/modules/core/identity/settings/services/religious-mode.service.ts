import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import {
  DEFAULT_RELIGIOUS_MODE_CONFIG,
  ReligiousModeConfig,
  RELIGIOUS_PRESETS,
  ReligionCode,
} from '../data/religious-presets';

const SETTINGS_KEY = 'religious_mode';

/** IST offset in minutes */
const IST_OFFSET = 330;

function nowIST(): { hhmm: string; dateStr: string } {
  const now = new Date();
  const istMs = now.getTime() + IST_OFFSET * 60 * 1000;
  const ist = new Date(istMs);
  const hhmm = `${String(ist.getUTCHours()).padStart(2, '0')}:${String(ist.getUTCMinutes()).padStart(2, '0')}`;
  const dateStr = ist.toISOString().split('T')[0]; // YYYY-MM-DD
  return { hhmm, dateStr };
}

@Injectable()
export class ReligiousModeService {
  private readonly logger = new Logger(ReligiousModeService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Get current religious mode config for tenant (with defaults). */
  async getConfig(tenantId: string): Promise<ReligiousModeConfig> {
    const tenant = await this.prisma.identity.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    const settings = (tenant?.settings as Record<string, any>) ?? {};
    return { ...DEFAULT_RELIGIOUS_MODE_CONFIG, ...(settings[SETTINGS_KEY] ?? {}) };
  }

  /** Update religious mode config (partial merge). */
  async updateConfig(tenantId: string, patch: Partial<ReligiousModeConfig>): Promise<ReligiousModeConfig> {
    const tenant = await this.prisma.identity.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    const existing = (tenant?.settings as Record<string, any>) ?? {};
    const current: ReligiousModeConfig = { ...DEFAULT_RELIGIOUS_MODE_CONFIG, ...(existing[SETTINGS_KEY] ?? {}) };
    const updated: ReligiousModeConfig = { ...current, ...patch };

    // Auto-populate greeting from preset when religion/deity changes
    if (patch.religion || patch.deity) {
      const religion = (patch.religion ?? current.religion) as ReligionCode;
      const deity = patch.deity ?? current.deity;
      const preset = RELIGIOUS_PRESETS[religion];
      const deityPreset = preset?.deities.find((d) => d.code === deity) ?? preset?.deities[0];
      if (deityPreset && !patch.greeting) {
        updated.greeting = { primary: deityPreset.greeting, secondary: current.greeting.secondary };
      }
    }

    const newSettings = { ...existing, [SETTINGS_KEY]: updated };
    await this.prisma.identity.tenant.update({
      where: { id: tenantId },
      data: { settings: newSettings },
    });

    return updated;
  }

  /**
   * Check if puja should be shown for this user right now.
   * Returns the config only if all conditions pass.
   */
  async getStatus(
    tenantId: string,
    userId: string,
    roleId: string | undefined,
    role: string,
  ): Promise<{ show: boolean; config?: ReligiousModeConfig }> {
    const config = await this.getConfig(tenantId);

    if (!config.enabled) return { show: false };

    // Check office hours (IST)
    const { hhmm } = nowIST();
    if (hhmm < config.officeHours.from || hhmm >= config.officeHours.to) {
      return { show: false };
    }

    // Check allowedFor
    if (config.allowedFor === 'ADMIN_ONLY') {
      if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) return { show: false };
    } else if (config.allowedFor === 'SELECTED_ROLES') {
      if (!roleId || !config.allowedRoleIds.includes(roleId)) return { show: false };
    }

    return { show: true, config };
  }

  /** Get all religion/deity presets (for settings UI). */
  getPresets() {
    return RELIGIOUS_PRESETS;
  }

  /** Log a puja interaction (stored in tenant settings as rolling 7-day summary). */
  async logInteraction(
    tenantId: string,
    userId: string,
    items: string[],
    durationSeconds: number,
    date: string,
  ): Promise<void> {
    try {
      const tenant = await this.prisma.identity.tenant.findUnique({
        where: { id: tenantId },
        select: { settings: true },
      });
      const settings = (tenant?.settings as Record<string, any>) ?? {};
      const log: any[] = settings['religious_mode_log'] ?? [];

      log.push({ userId, items, durationSeconds, date, ts: new Date().toISOString() });

      // Keep only last 7 days of logs
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      const trimmed = log.filter((l) => l.date >= cutoffStr).slice(-500);

      await this.prisma.identity.tenant.update({
        where: { id: tenantId },
        data: { settings: { ...settings, religious_mode_log: trimmed } },
      });
    } catch (e) {
      this.logger.warn('Failed to log puja interaction', e);
    }
  }

  /** Get puja engagement analytics for last 7 days. */
  async getAnalytics(tenantId: string) {
    const tenant = await this.prisma.identity.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    const settings = (tenant?.settings as Record<string, any>) ?? {};
    const log: any[] = settings['religious_mode_log'] ?? [];

    const today = nowIST().dateStr;
    const todayLogs = log.filter((l) => l.date === today);
    const uniqueUsersToday = new Set(todayLogs.map((l) => l.userId)).size;

    // Item frequency
    const itemCounts: Record<string, number> = {};
    log.forEach((l) => {
      (l.items ?? []).forEach((item: string) => {
        itemCounts[item] = (itemCounts[item] ?? 0) + 1;
      });
    });

    const topItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([item, count]) => ({ item, count }));

    const avgDuration = log.length > 0
      ? Math.round(log.reduce((sum, l) => sum + (l.durationSeconds ?? 0), 0) / log.length)
      : 0;

    // Streak — count consecutive days with at least 1 interaction
    const days = [...new Set(log.map((l) => l.date))].sort().reverse();
    let streak = 0;
    for (let i = 0; i < days.length; i++) {
      const expected = new Date();
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().split('T')[0];
      if (days[i] === expectedStr) streak++;
      else break;
    }

    return {
      totalInteractions: log.length,
      uniqueUsersToday,
      topItems,
      avgDurationSeconds: avgDuration,
      streakDays: streak,
    };
  }
}
