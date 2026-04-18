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
var SendLocationMessageHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendLocationMessageHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const send_location_message_command_1 = require("./send-location-message.command");
const wa_message_sender_service_1 = require("../../../services/wa-message-sender.service");
let SendLocationMessageHandler = SendLocationMessageHandler_1 = class SendLocationMessageHandler {
    constructor(messageSender) {
        this.messageSender = messageSender;
        this.logger = new common_1.Logger(SendLocationMessageHandler_1.name);
    }
    async execute(cmd) {
        try {
            const result = await this.messageSender.sendLocation(cmd.wabaId, cmd.conversationId, cmd.lat, cmd.lng, cmd.name, cmd.address, cmd.userId);
            this.logger.log(`Location message sent in conversation ${cmd.conversationId} by user ${cmd.userId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`SendLocationMessageHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SendLocationMessageHandler = SendLocationMessageHandler;
exports.SendLocationMessageHandler = SendLocationMessageHandler = SendLocationMessageHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(send_location_message_command_1.SendLocationMessageCommand),
    __metadata("design:paramtypes", [wa_message_sender_service_1.WaMessageSenderService])
], SendLocationMessageHandler);
//# sourceMappingURL=send-location-message.handler.js.map