"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SendNotificationAction_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendNotificationAction = void 0;
const common_1 = require("@nestjs/common");
let SendNotificationAction = SendNotificationAction_1 = class SendNotificationAction {
    constructor() {
        this.type = 'SEND_NOTIFICATION';
        this.logger = new common_1.Logger(SendNotificationAction_1.name);
    }
    async execute(config, context) {
        const { userId, message, type: notifType } = config;
        if (!userId || !message) {
            return { status: 'FAILED', errorMessage: 'Missing "userId" or "message" in notification config' };
        }
        this.logger.log(`[NOTIFICATION PLACEHOLDER] User: ${userId}, Type: ${notifType || 'INFO'}, ` +
            `Message: ${message}`);
        return {
            status: 'SUCCESS',
            result: { userId, message, type: notifType || 'INFO', sentAt: new Date().toISOString() },
        };
    }
};
exports.SendNotificationAction = SendNotificationAction;
exports.SendNotificationAction = SendNotificationAction = SendNotificationAction_1 = __decorate([
    (0, common_1.Injectable)()
], SendNotificationAction);
//# sourceMappingURL=send-notification.action.js.map