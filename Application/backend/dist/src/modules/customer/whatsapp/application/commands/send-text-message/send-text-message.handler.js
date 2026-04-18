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
var SendTextMessageHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendTextMessageHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const send_text_message_command_1 = require("./send-text-message.command");
const wa_message_sender_service_1 = require("../../../services/wa-message-sender.service");
let SendTextMessageHandler = SendTextMessageHandler_1 = class SendTextMessageHandler {
    constructor(messageSender) {
        this.messageSender = messageSender;
        this.logger = new common_1.Logger(SendTextMessageHandler_1.name);
    }
    async execute(cmd) {
        try {
            const result = await this.messageSender.sendText(cmd.wabaId, cmd.conversationId, cmd.text, cmd.userId);
            this.logger.log(`Text message sent in conversation ${cmd.conversationId} by user ${cmd.userId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`SendTextMessageHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SendTextMessageHandler = SendTextMessageHandler;
exports.SendTextMessageHandler = SendTextMessageHandler = SendTextMessageHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(send_text_message_command_1.SendTextMessageCommand),
    __metadata("design:paramtypes", [wa_message_sender_service_1.WaMessageSenderService])
], SendTextMessageHandler);
//# sourceMappingURL=send-text-message.handler.js.map