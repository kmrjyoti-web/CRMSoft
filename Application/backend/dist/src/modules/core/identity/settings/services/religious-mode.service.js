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
var ReligiousModeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReligiousModeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const religious_presets_1 = require("../data/religious-presets");
const SETTINGS_KEY = 'religious_mode';
const IST_OFFSET = 330;
function nowIST() {
    const now = new Date();
    const istMs = now.getTime() + IST_OFFSET * 60 * 1000;
    const ist = new Date(istMs);
    const hhmm = `${String(ist.getUTCHours()).padStart(2, '0')}:${String(ist.getUTCMinutes()).padStart(2, '0')}`;
    const dateStr = ist.toISOString().split('T')[0];
    return { hhmm, dateStr };
}
let ReligiousModeService = ReligiousModeService_1 = class ReligiousModeService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ReligiousModeService_1.name);
    }
    async getConfig(tenantId) {
        const tenant = await this.prisma.identity.tenant.findUnique({
            where: { id: tenantId },
            select: { settings: true },
        });
        const settings = tenant?.settings ?? {};
        return { ...religious_presets_1.DEFAULT_RELIGIOUS_MODE_CONFIG, ...(settings[SETTINGS_KEY] ?? {}) };
    }
    async updateConfig(tenantId, patch) {
        const tenant = await this.prisma.identity.tenant.findUnique({
            where: { id: tenantId },
            select: { settings: true },
        });
        const existing = tenant?.settings ?? {};
        const current = { ...religious_presets_1.DEFAULT_RELIGIOUS_MODE_CONFIG, ...(existing[SETTINGS_KEY] ?? {}) };
        const updated = { ...current, ...patch };
        if (patch.religion || patch.deity) {
            const religion = (patch.religion ?? current.religion);
            const deity = patch.deity ?? current.deity;
            const preset = religious_presets_1.RELIGIOUS_PRESETS[religion];
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
    async getStatus(tenantId, userId, roleId, role) {
        const config = await this.getConfig(tenantId);
        if (!config.enabled)
            return { show: false };
        const { hhmm } = nowIST();
        if (hhmm < config.officeHours.from || hhmm >= config.officeHours.to) {
            return { show: false };
        }
        if (config.allowedFor === 'ADMIN_ONLY') {
            if (!['ADMIN', 'SUPER_ADMIN'].includes(role))
                return { show: false };
        }
        else if (config.allowedFor === 'SELECTED_ROLES') {
            if (!roleId || !config.allowedRoleIds.includes(roleId))
                return { show: false };
        }
        return { show: true, config };
    }
    getPresets() {
        return religious_presets_1.RELIGIOUS_PRESETS;
    }
    async logInteraction(tenantId, userId, items, durationSeconds, date) {
        try {
            const tenant = await this.prisma.identity.tenant.findUnique({
                where: { id: tenantId },
                select: { settings: true },
            });
            const settings = tenant?.settings ?? {};
            const log = settings['religious_mode_log'] ?? [];
            log.push({ userId, items, durationSeconds, date, ts: new Date().toISOString() });
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - 7);
            const cutoffStr = cutoff.toISOString().split('T')[0];
            const trimmed = log.filter((l) => l.date >= cutoffStr).slice(-500);
            await this.prisma.identity.tenant.update({
                where: { id: tenantId },
                data: { settings: { ...settings, religious_mode_log: trimmed } },
            });
        }
        catch (e) {
            this.logger.warn('Failed to log puja interaction', e);
        }
    }
    async getAnalytics(tenantId) {
        const tenant = await this.prisma.identity.tenant.findUnique({
            where: { id: tenantId },
            select: { settings: true },
        });
        const settings = tenant?.settings ?? {};
        const log = settings['religious_mode_log'] ?? [];
        const today = nowIST().dateStr;
        const todayLogs = log.filter((l) => l.date === today);
        const uniqueUsersToday = new Set(todayLogs.map((l) => l.userId)).size;
        const itemCounts = {};
        log.forEach((l) => {
            (l.items ?? []).forEach((item) => {
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
        const days = [...new Set(log.map((l) => l.date))].sort().reverse();
        let streak = 0;
        for (let i = 0; i < days.length; i++) {
            const expected = new Date();
            expected.setDate(expected.getDate() - i);
            const expectedStr = expected.toISOString().split('T')[0];
            if (days[i] === expectedStr)
                streak++;
            else
                break;
        }
        return {
            totalInteractions: log.length,
            uniqueUsersToday,
            topItems,
            avgDurationSeconds: avgDuration,
            streakDays: streak,
        };
    }
};
exports.ReligiousModeService = ReligiousModeService;
exports.ReligiousModeService = ReligiousModeService = ReligiousModeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReligiousModeService);
//# sourceMappingURL=religious-mode.service.js.map