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
var ReopenConversationHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReopenConversationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const reopen_conversation_command_1 = require("./reopen-conversation.command");
const wa_conversation_service_1 = require("../../../services/wa-conversation.service");
let ReopenConversationHandler = ReopenConversationHandler_1 = class ReopenConversationHandler {
    constructor(waConversationService) {
        this.waConversationService = waConversationService;
        this.logger = new common_1.Logger(ReopenConversationHandler_1.name);
    }
    async execute(command) {
        try {
            await this.waConversationService.reopen(command.conversationId);
            this.logger.log(`Conversation ${command.conversationId} reopened`);
        }
        catch (error) {
            this.logger.error(`ReopenConversationHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ReopenConversationHandler = ReopenConversationHandler;
exports.ReopenConversationHandler = ReopenConversationHandler = ReopenConversationHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(reopen_conversation_command_1.ReopenConversationCommand),
    __metadata("design:paramtypes", [wa_conversation_service_1.WaConversationService])
], ReopenConversationHandler);
//# sourceMappingURL=reopen-conversation.handler.js.map