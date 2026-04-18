"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SendEmailAction_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendEmailAction = void 0;
const common_1 = require("@nestjs/common");
let SendEmailAction = SendEmailAction_1 = class SendEmailAction {
    constructor() {
        this.type = 'SEND_EMAIL';
        this.logger = new common_1.Logger(SendEmailAction_1.name);
    }
    async execute(config, context) {
        const { to, subject, body, template } = config;
        if (!to || !subject) {
            return { status: 'FAILED', errorMessage: 'Missing "to" or "subject" in email config' };
        }
        this.logger.log(`[EMAIL PLACEHOLDER] To: ${to}, Subject: ${subject}, ` +
            `Entity: ${context.entityType}/${context.entityId}`);
        return {
            status: 'SUCCESS',
            result: { to, subject, template: template || 'default', sentAt: new Date().toISOString() },
        };
    }
};
exports.SendEmailAction = SendEmailAction;
exports.SendEmailAction = SendEmailAction = SendEmailAction_1 = __decorate([
    (0, common_1.Injectable)()
], SendEmailAction);
//# sourceMappingURL=send-email.action.js.map