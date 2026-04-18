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
var ResolveConversationHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolveConversationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const resolve_conversation_command_1 = require("./resolve-conversation.command");
const wa_conversation_service_1 = require("../../../services/wa-conversation.service");
let ResolveConversationHandler = ResolveConversationHandler_1 = class ResolveConversationHandler {
    constructor(waConversationService) {
        this.waConversationService = waConversationService;
        this.logger = new common_1.Logger(ResolveConversationHandler_1.name);
    }
    async execute(command) {
        try {
            await this.waConversationService.resolve(command.conversationId);
            this.logger.log(`Conversation ${command.conversationId} resolved by user ${command.userId}`);
        }
        catch (error) {
            this.logger.error(`ResolveConversationHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ResolveConversationHandler = ResolveConversationHandler;
exports.ResolveConversationHandler = ResolveConversationHandler = ResolveConversationHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(resolve_conversation_command_1.ResolveConversationCommand),
    __metadata("design:paramtypes", [wa_conversation_service_1.WaConversationService])
], ResolveConversationHandler);
//# sourceMappingURL=resolve-conversation.handler.js.map