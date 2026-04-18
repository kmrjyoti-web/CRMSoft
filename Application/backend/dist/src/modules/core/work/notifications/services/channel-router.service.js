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
var ChannelRouterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelRouterService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const notification_core_service_1 = require("./notification-core.service");
const template_service_1 = require("./template.service");
const realtime_service_1 = require("./realtime.service");
const error_utils_1 = require("../../../../../common/utils/error.utils");
let ChannelRouterService = ChannelRouterService_1 = class ChannelRouterService {
    constructor(prisma, notificationCore, templateService, realtimeService) {
        this.prisma = prisma;
        this.notificationCore = notificationCore;
        this.templateService = templateService;
        this.realtimeService = realtimeService;
        this.logger = new common_1.Logger(ChannelRouterService_1.name);
    }
    async send(params) {
        const rendered = await this.templateService.render(params.templateName, params.variables);
        const preference = await this.getPreference(params.recipientId);
        let channels = params.channelOverrides || this.resolveChannels(rendered.channels, preference, rendered.category);
        if (this.isQuietHours(preference)) {
            channels = channels.filter(ch => ch === 'IN_APP');
        }
        const results = [];
        for (const channel of channels) {
            try {
                if (channel === 'IN_APP') {
                    const notification = await this.notificationCore.create({
                        category: rendered.category,
                        title: rendered.subject,
                        message: rendered.body,
                        recipientId: params.recipientId,
                        senderId: params.senderId,
                        priority: params.priority,
                        channel: 'IN_APP',
                        entityType: params.entityType,
                        entityId: params.entityId,
                        data: params.variables,
                        groupKey: params.groupKey,
                    });
                    this.realtimeService.sendToUser(params.recipientId, {
                        type: 'notification',
                        payload: notification,
                    });
                    results.push({ channel: 'IN_APP', success: true });
                }
                else if (channel === 'EMAIL') {
                    this.logger.log(`Email would be sent to ${params.recipientId}: ${rendered.subject}`);
                    results.push({ channel: 'EMAIL', success: true });
                }
                else if (channel === 'SMS') {
                    this.logger.log(`SMS would be sent to ${params.recipientId}: ${rendered.body}`);
                    results.push({ channel: 'SMS', success: true });
                }
                else if (channel === 'PUSH') {
                    this.logger.log(`Push would be sent to ${params.recipientId}`);
                    results.push({ channel: 'PUSH', success: true });
                }
                else if (channel === 'WHATSAPP') {
                    this.logger.log(`WhatsApp would be sent to ${params.recipientId}`);
                    results.push({ channel: 'WHATSAPP', success: true });
                }
            }
            catch (error) {
                this.logger.error(`Failed to send via ${channel}: ${(0, error_utils_1.getErrorMessage)(error)}`);
                results.push({ channel, success: false });
            }
        }
        return { channels: results, template: params.templateName };
    }
    async getPreference(userId) {
        return this.prisma.notificationPreference.findUnique({
            where: { userId },
        });
    }
    resolveChannels(templateChannels, preference, category) {
        if (!preference)
            return templateChannels.length > 0 ? templateChannels : ['IN_APP'];
        const categoryPrefs = preference.categories?.[category];
        if (categoryPrefs?.channels)
            return categoryPrefs.channels;
        const globalChannels = preference.channels;
        if (globalChannels?.enabled)
            return globalChannels.enabled;
        return templateChannels.length > 0 ? templateChannels : ['IN_APP'];
    }
    isQuietHours(preference) {
        if (!preference?.quietHoursStart || !preference?.quietHoursEnd)
            return false;
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const currentTime = hours * 60 + minutes;
        const [startH, startM] = preference.quietHoursStart.split(':').map(Number);
        const [endH, endM] = preference.quietHoursEnd.split(':').map(Number);
        const startTime = startH * 60 + startM;
        const endTime = endH * 60 + endM;
        if (startTime <= endTime) {
            return currentTime >= startTime && currentTime <= endTime;
        }
        return currentTime >= startTime || currentTime <= endTime;
    }
};
exports.ChannelRouterService = ChannelRouterService;
exports.ChannelRouterService = ChannelRouterService = ChannelRouterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_core_service_1.NotificationCoreService,
        template_service_1.NotificationTemplateService,
        realtime_service_1.RealtimeService])
], ChannelRouterService);
//# sourceMappingURL=channel-router.service.js.map