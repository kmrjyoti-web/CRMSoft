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
var SendMediaMessageHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendMediaMessageHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const send_media_message_command_1 = require("./send-media-message.command");
const wa_message_sender_service_1 = require("../../../services/wa-message-sender.service");
let SendMediaMessageHandler = SendMediaMessageHandler_1 = class SendMediaMessageHandler {
    constructor(messageSender) {
        this.messageSender = messageSender;
        this.logger = new common_1.Logger(SendMediaMessageHandler_1.name);
    }
    async execute(cmd) {
        try {
            const result = await this.messageSender.sendMedia(cmd.wabaId, cmd.conversationId, cmd.type, cmd.mediaUrl, cmd.caption, cmd.userId);
            this.logger.log(`Media message (${cmd.type}) sent in conversation ${cmd.conversationId} by user ${cmd.userId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`SendMediaMessageHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SendMediaMessageHandler = SendMediaMessageHandler;
exports.SendMediaMessageHandler = SendMediaMessageHandler = SendMediaMessageHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(send_media_message_command_1.SendMediaMessageCommand),
    __metadata("design:paramtypes", [wa_message_sender_service_1.WaMessageSenderService])
], SendMediaMessageHandler);
//# sourceMappingURL=send-media-message.handler.js.map