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
var ActionExecutorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionExecutorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const template_resolver_service_1 = require("./template-resolver.service");
const field_update_action_1 = require("./actions/field-update.action");
const send_email_action_1 = require("./actions/send-email.action");
const send_notification_action_1 = require("./actions/send-notification.action");
const create_activity_action_1 = require("./actions/create-activity.action");
const create_task_action_1 = require("./actions/create-task.action");
const webhook_action_1 = require("./actions/webhook.action");
const assign_owner_action_1 = require("./actions/assign-owner.action");
let ActionExecutorService = ActionExecutorService_1 = class ActionExecutorService {
    constructor(prisma, templateResolver, fieldUpdate, sendEmail, sendNotification, createActivity, createTask, webhook, assignOwner) {
        this.prisma = prisma;
        this.templateResolver = templateResolver;
        this.logger = new common_1.Logger(ActionExecutorService_1.name);
        this.handlers = new Map();
        const all = [fieldUpdate, sendEmail, sendNotification, createActivity, createTask, webhook, assignOwner];
        for (const handler of all) {
            this.handlers.set(handler.type, handler);
        }
    }
    async executeAll(actions, context, instanceId, transitionId) {
        if (!actions || actions.length === 0)
            return;
        for (const action of actions) {
            const result = await this.executeSingle(action, context);
            await this.logAction(instanceId, transitionId, action.type, action.config, result);
        }
    }
    async executeSingle(action, context) {
        const handler = this.handlers.get(action.type);
        if (!handler) {
            this.logger.warn(`No handler registered for action type: ${action.type}`);
            return { status: 'SKIPPED', errorMessage: `Unknown action type: ${action.type}` };
        }
        try {
            const resolvedConfig = this.templateResolver.resolveObject(action.config || {}, context);
            return await handler.execute(resolvedConfig, context);
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Action ${action.type} failed: ${msg}`);
            return { status: 'FAILED', errorMessage: msg };
        }
    }
    async logAction(instanceId, transitionId, actionType, actionconfig, result) {
        try {
            await this.prisma.working.workflowActionLog.create({
                data: {
                    instanceId,
                    transitionId,
                    actionType,
                    actionConfig: (actionconfig || {}),
                    result: (result.result || {}),
                    status: result.status,
                    errorMessage: result.errorMessage || null,
                    executedAt: new Date(),
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to log action: ${(error instanceof Error ? error.message : String(error))}`);
        }
    }
};
exports.ActionExecutorService = ActionExecutorService;
exports.ActionExecutorService = ActionExecutorService = ActionExecutorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        template_resolver_service_1.TemplateResolverService,
        field_update_action_1.FieldUpdateAction,
        send_email_action_1.SendEmailAction,
        send_notification_action_1.SendNotificationAction,
        create_activity_action_1.CreateActivityAction,
        create_task_action_1.CreateTaskAction,
        webhook_action_1.WebhookAction,
        assign_owner_action_1.AssignOwnerAction])
], ActionExecutorService);
//# sourceMappingURL=action-executor.service.js.map