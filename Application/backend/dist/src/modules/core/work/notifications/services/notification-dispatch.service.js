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
var NotificationDispatchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationDispatchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const notification_config_service_1 = require("./notification-config.service");
const channel_router_service_1 = require("./channel-router.service");
const quiet_hour_service_1 = require("./quiet-hour.service");
const error_utils_1 = require("../../../../../common/utils/error.utils");
let NotificationDispatchService = NotificationDispatchService_1 = class NotificationDispatchService {
    constructor(prisma, configService, channelRouter, quietHourService) {
        this.prisma = prisma;
        this.configService = configService;
        this.channelRouter = channelRouter;
        this.quietHourService = quietHourService;
        this.logger = new common_1.Logger(NotificationDispatchService_1.name);
    }
    async dispatch(event) {
        const { tenantId, eventType, entityType, entityId, actorId, data } = event;
        const config = await this.configService.getConfigForEvent(eventType, tenantId);
        if (!config || !config.isEnabled) {
            this.logger.debug(`Dispatch skipped: config not found or disabled for ${eventType}`);
            return { dispatched: 0, skipped: 0 };
        }
        const recipientIds = await this.resolveRecipients(config, entityType, entityId, tenantId);
        const filteredRecipients = recipientIds.filter((id) => id !== actorId);
        if (filteredRecipients.length === 0) {
            this.logger.debug(`Dispatch skipped: no recipients after filtering actor for ${eventType}`);
            return { dispatched: 0, skipped: 0 };
        }
        const templateName = config.template?.name || eventType.toLowerCase().replace(/_/g, '_');
        const priority = data.priority || 'MEDIUM';
        let dispatched = 0;
        let skipped = 0;
        for (const recipientId of filteredRecipients) {
            try {
                const inQuietHours = await this.quietHourService.isInQuietHours(recipientId, tenantId, priority);
                let channelOverrides;
                if (inQuietHours && config.respectQuietHours) {
                    channelOverrides = ['IN_APP'];
                    this.logger.debug(`Quiet hours active for user ${recipientId}, restricting to IN_APP`);
                }
                const variables = {};
                for (const [key, value] of Object.entries(data)) {
                    variables[key] = String(value ?? '');
                }
                await this.channelRouter.send({
                    templateName,
                    recipientId,
                    senderId: actorId,
                    variables,
                    entityType,
                    entityId,
                    priority,
                    channelOverrides,
                    groupKey: `${eventType}:${entityType || ''}:${entityId || ''}`,
                });
                dispatched++;
            }
            catch (error) {
                this.logger.error(`Failed to dispatch notification to ${recipientId} for ${eventType}: ${(0, error_utils_1.getErrorMessage)(error)}`);
                skipped++;
            }
        }
        this.logger.log(`Dispatch complete for ${eventType}: ${dispatched} sent, ${skipped} skipped`);
        return { dispatched, skipped };
    }
    async resolveRecipients(config, entityType, entityId, tenantId = '') {
        const recipientSet = new Set();
        if (!entityType || !entityId) {
            this.addCustomRecipients(config, recipientSet);
            return Array.from(recipientSet);
        }
        const entity = await this.loadEntity(entityType, entityId);
        if (entity) {
            if (config.notifyAssignee && entity.assignedToId) {
                recipientSet.add(entity.assignedToId);
            }
            if (config.notifyCreator && entity.createdById) {
                recipientSet.add(entity.createdById);
            }
            if (config.notifyManager && entity.assignedToId) {
                const assignee = await this.prisma.user.findUnique({
                    where: { id: entity.assignedToId },
                    select: { reportingToId: true },
                });
                if (assignee?.reportingToId) {
                    recipientSet.add(assignee.reportingToId);
                }
            }
            if (config.notifyWatchers) {
                await this.addWatchers(entityType, entityId, recipientSet);
            }
            if (config.notifyDepartment && entity.assignedToId) {
                await this.addDepartmentMembers(entity.assignedToId, tenantId, recipientSet);
            }
        }
        this.addCustomRecipients(config, recipientSet);
        return Array.from(recipientSet);
    }
    addCustomRecipients(config, recipientSet) {
        if (config.customRecipientIds) {
            const customIds = config.customRecipientIds;
            if (Array.isArray(customIds)) {
                for (const id of customIds) {
                    recipientSet.add(id);
                }
            }
        }
    }
    async loadEntity(entityType, entityId) {
        const normalizedType = entityType.toLowerCase();
        try {
            switch (normalizedType) {
                case 'task':
                    return this.prisma.task.findUnique({
                        where: { id: entityId },
                        select: { assignedToId: true, createdById: true },
                    });
                case 'lead': {
                    const lead = await this.prisma.lead.findUnique({
                        where: { id: entityId },
                        select: { allocatedToId: true, createdById: true },
                    });
                    return lead ? { assignedToId: lead.allocatedToId, createdById: lead.createdById } : null;
                }
                case 'contact':
                    return this.prisma.contact.findUnique({
                        where: { id: entityId },
                        select: { createdById: true },
                    }).then((c) => c ? { assignedToId: null, createdById: c.createdById } : null);
                case 'organization':
                    return this.prisma.organization.findUnique({
                        where: { id: entityId },
                        select: { createdById: true },
                    }).then((o) => o ? { assignedToId: null, createdById: o.createdById } : null);
                case 'quotation':
                    return this.prisma.quotation.findUnique({
                        where: { id: entityId },
                        select: { createdById: true },
                    }).then((q) => q ? { assignedToId: null, createdById: q.createdById } : null);
                default:
                    this.logger.warn(`Unknown entity type for dispatch: ${entityType}`);
                    return null;
            }
        }
        catch {
            this.logger.warn(`Failed to load entity ${entityType}:${entityId}`);
            return null;
        }
    }
    async addWatchers(entityType, entityId, recipientSet) {
        try {
            if (entityType.toLowerCase() === 'task') {
                const watchers = await this.prisma.taskWatcher.findMany({
                    where: { taskId: entityId },
                    select: { userId: true },
                });
                for (const w of watchers) {
                    recipientSet.add(w.userId);
                }
            }
        }
        catch {
            this.logger.debug(`Failed to load watchers for ${entityType}:${entityId}`);
        }
    }
    async addDepartmentMembers(assigneeId, tenantId, recipientSet) {
        try {
            const assignee = await this.prisma.user.findUnique({
                where: { id: assigneeId },
                select: { departmentId: true },
            });
            if (assignee?.departmentId) {
                const deptMembers = await this.prisma.user.findMany({
                    where: {
                        departmentId: assignee.departmentId,
                        isDeleted: false,
                        ...(tenantId ? { tenantId } : {}),
                    },
                    select: { id: true },
                    take: 50,
                });
                for (const m of deptMembers) {
                    recipientSet.add(m.id);
                }
            }
        }
        catch {
            this.logger.debug(`Failed to resolve department members for assignee ${assigneeId}`);
        }
    }
};
exports.NotificationDispatchService = NotificationDispatchService;
exports.NotificationDispatchService = NotificationDispatchService = NotificationDispatchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_config_service_1.NotificationConfigService,
        channel_router_service_1.ChannelRouterService,
        quiet_hour_service_1.QuietHourService])
], NotificationDispatchService);
//# sourceMappingURL=notification-dispatch.service.js.map