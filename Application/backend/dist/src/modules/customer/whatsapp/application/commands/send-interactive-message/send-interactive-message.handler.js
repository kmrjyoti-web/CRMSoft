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
var SendInteractiveMessageHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendInteractiveMessageHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const send_interactive_message_command_1 = require("./send-interactive-message.command");
const wa_message_sender_service_1 = require("../../../services/wa-message-sender.service");
let SendInteractiveMessageHandler = SendInteractiveMessageHandler_1 = class SendInteractiveMessageHandler {
    constructor(messageSender) {
        this.messageSender = messageSender;
        this.logger = new common_1.Logger(SendInteractiveMessageHandler_1.name);
    }
    async execute(cmd) {
        try {
            const result = await this.messageSender.sendInteractive(cmd.wabaId, cmd.conversationId, cmd.interactiveType, cmd.interactiveData, cmd.userId);
            this.logger.log(`Interactive message (${cmd.interactiveType}) sent in conversation ${cmd.conversationId} by user ${cmd.userId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`SendInteractiveMessageHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SendInteractiveMessageHandler = SendInteractiveMessageHandler;
exports.SendInteractiveMessageHandler = SendInteractiveMessageHandler = SendInteractiveMessageHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(send_interactive_message_command_1.SendInteractiveMessageCommand),
    __metadata("design:paramtypes", [wa_message_sender_service_1.WaMessageSenderService])
], SendInteractiveMessageHandler);
//# sourceMappingURL=send-interactive-message.handler.js.map