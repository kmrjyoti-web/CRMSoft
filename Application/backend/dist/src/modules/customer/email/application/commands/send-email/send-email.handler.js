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
var SendEmailHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendEmailHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const send_email_command_1 = require("./send-email.command");
const email_sender_service_1 = require("../../../services/email-sender.service");
let SendEmailHandler = SendEmailHandler_1 = class SendEmailHandler {
    constructor(emailSender) {
        this.emailSender = emailSender;
        this.logger = new common_1.Logger(SendEmailHandler_1.name);
    }
    async execute(cmd) {
        try {
            await this.emailSender.send(cmd.emailId);
            this.logger.log(`Email sent: ${cmd.emailId} by user ${cmd.userId}`);
        }
        catch (error) {
            this.logger.error(`SendEmailHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SendEmailHandler = SendEmailHandler;
exports.SendEmailHandler = SendEmailHandler = SendEmailHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(send_email_command_1.SendEmailCommand),
    __metadata("design:paramtypes", [email_sender_service_1.EmailSenderService])
], SendEmailHandler);
//# sourceMappingURL=send-email.handler.js.map