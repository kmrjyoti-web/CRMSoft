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
exports.PreferenceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let PreferenceService = class PreferenceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPreferences(userId) {
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
    async updatePreferences(userId, data) {
        const updateData = {};
        if (data.channels !== undefined)
            updateData.channels = data.channels;
        if (data.categories !== undefined)
            updateData.categories = data.categories;
        if (data.quietHoursStart !== undefined)
            updateData.quietHoursStart = data.quietHoursStart;
        if (data.quietHoursEnd !== undefined)
            updateData.quietHoursEnd = data.quietHoursEnd;
        if (data.digestFrequency !== undefined)
            updateData.digestFrequency = data.digestFrequency;
        if (data.timezone !== undefined)
            updateData.timezone = data.timezone;
        return this.prisma.notificationPreference.upsert({
            where: { userId },
            update: updateData,
            create: {
                userId,
                channels: data.channels || { enabled: ['IN_APP', 'EMAIL'] },
                categories: data.categories || {},
                digestFrequency: data.digestFrequency || 'REALTIME',
                timezone: data.timezone || 'Asia/Kolkata',
                quietHoursStart: data.quietHoursStart,
                quietHoursEnd: data.quietHoursEnd,
            },
        });
    }
    async registerPushSubscription(userId, data) {
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
    async unregisterPushSubscription(userId, endpoint) {
        const result = await this.prisma.pushSubscription.updateMany({
            where: { userId, endpoint, isActive: true },
            data: { isActive: false },
        });
        if (result.count === 0)
            throw new common_1.NotFoundException('Push subscription not found');
        return { unregistered: result.count };
    }
    async getPushSubscriptions(userId) {
        return this.prisma.pushSubscription.findMany({
            where: { userId, isActive: true },
        });
    }
};
exports.PreferenceService = PreferenceService;
exports.PreferenceService = PreferenceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PreferenceService);
//# sourceMappingURL=preference.service.js.map