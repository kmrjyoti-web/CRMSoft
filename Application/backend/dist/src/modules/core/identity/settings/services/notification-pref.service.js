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
var NotificationPrefService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPrefService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let NotificationPrefService = NotificationPrefService_1 = class NotificationPrefService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(NotificationPrefService_1.name);
    }
    async getForEvent(tenantId, eventCode) {
        return this.prisma.notificationConfig.findUnique({
            where: { tenantId_eventCode: { tenantId, eventCode } },
        });
    }
    async getAllGrouped(tenantId) {
        const all = await this.prisma.notificationConfig.findMany({
            where: { tenantId },
            orderBy: [{ eventCategory: 'asc' }, { eventName: 'asc' }],
        });
        const grouped = {};
        for (const pref of all) {
            const cat = pref.eventCategory ?? 'SYSTEM';
            if (!grouped[cat])
                grouped[cat] = [];
            grouped[cat].push(pref);
        }
        return grouped;
    }
    async update(tenantId, eventCode, data) {
        return this.prisma.notificationConfig.update({
            where: { tenantId_eventCode: { tenantId, eventCode } },
            data,
        });
    }
    async bulkUpdate(tenantId, updates) {
        await this.prisma.identity.$transaction(updates.map((u) => this.prisma.notificationConfig.update({
            where: { tenantId_eventCode: { tenantId, eventCode: u.eventCode } },
            data: u.changes,
        })));
    }
    async sendTest(tenantId, eventCode) {
        const pref = await this.getForEvent(tenantId, eventCode);
        if (!pref)
            return { sent: false, channels: [] };
        const channels = [];
        if (pref.enableInAppAlert)
            channels.push('IN_APP');
        if (pref.enableEmail)
            channels.push('EMAIL');
        if (pref.enableSms)
            channels.push('SMS');
        if (pref.enableWhatsapp)
            channels.push('WHATSAPP');
        if (pref.enablePush)
            channels.push('PUSH');
        this.logger.log(`Test notification for ${eventCode}: ${channels.join(', ')}`);
        return { sent: true, channels };
    }
};
exports.NotificationPrefService = NotificationPrefService;
exports.NotificationPrefService = NotificationPrefService = NotificationPrefService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationPrefService);
//# sourceMappingURL=notification-pref.service.js.map