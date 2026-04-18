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
var NotificationConfigService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationConfigService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let NotificationConfigService = NotificationConfigService_1 = class NotificationConfigService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(NotificationConfigService_1.name);
    }
    async getConfigForEvent(eventCode, tenantId = '') {
        return this.prisma.notificationConfig.findUnique({
            where: { tenantId_eventCode: { tenantId, eventCode } },
            include: { template: true },
        });
    }
    async getAllConfigs(tenantId = '') {
        return this.prisma.notificationConfig.findMany({
            where: { tenantId },
            include: { template: true },
            orderBy: { eventCode: 'asc' },
        });
    }
    async upsertConfig(eventCode, channels, templateId, tenantId = '') {
        return this.prisma.notificationConfig.upsert({
            where: { tenantId_eventCode: { tenantId, eventCode } },
            update: { channels, templateId, updatedAt: new Date() },
            create: { tenantId, eventCode, channels, templateId },
            include: { template: true },
        });
    }
    async isEventEnabled(eventCode, tenantId = '') {
        const config = await this.prisma.notificationConfig.findUnique({
            where: { tenantId_eventCode: { tenantId, eventCode } },
        });
        return config?.isEnabled ?? true;
    }
    async getChannelsForEvent(eventCode, tenantId = '') {
        const config = await this.getConfigForEvent(eventCode, tenantId);
        if (!config || !config.isEnabled)
            return [];
        return config.channels || ['IN_APP'];
    }
};
exports.NotificationConfigService = NotificationConfigService;
exports.NotificationConfigService = NotificationConfigService = NotificationConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationConfigService);
//# sourceMappingURL=notification-config.service.js.map