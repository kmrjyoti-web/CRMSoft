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
var SendNotificationHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendNotificationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const send_notification_command_1 = require("./send-notification.command");
const channel_router_service_1 = require("../../../services/channel-router.service");
let SendNotificationHandler = SendNotificationHandler_1 = class SendNotificationHandler {
    constructor(channelRouter) {
        this.channelRouter = channelRouter;
        this.logger = new common_1.Logger(SendNotificationHandler_1.name);
    }
    async execute(command) {
        try {
            return this.channelRouter.send({
                templateName: command.templateName,
                recipientId: command.recipientId,
                senderId: command.senderId,
                variables: command.variables,
                entityType: command.entityType,
                entityId: command.entityId,
                priority: command.priority,
                groupKey: command.groupKey,
                channelOverrides: command.channelOverrides,
            });
        }
        catch (error) {
            this.logger.error(`SendNotificationHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SendNotificationHandler = SendNotificationHandler;
exports.SendNotificationHandler = SendNotificationHandler = SendNotificationHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(send_notification_command_1.SendNotificationCommand),
    __metadata("design:paramtypes", [channel_router_service_1.ChannelRouterService])
], SendNotificationHandler);
//# sourceMappingURL=send-notification.handler.js.map