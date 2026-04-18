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
var AssignConversationHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignConversationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const assign_conversation_command_1 = require("./assign-conversation.command");
const wa_conversation_service_1 = require("../../../services/wa-conversation.service");
let AssignConversationHandler = AssignConversationHandler_1 = class AssignConversationHandler {
    constructor(conversationService) {
        this.conversationService = conversationService;
        this.logger = new common_1.Logger(AssignConversationHandler_1.name);
    }
    async execute(cmd) {
        try {
            const result = await this.conversationService.assign(cmd.conversationId, cmd.assignToUserId);
            this.logger.log(`Conversation ${cmd.conversationId} assigned to ${cmd.assignToUserId} by user ${cmd.userId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`AssignConversationHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.AssignConversationHandler = AssignConversationHandler;
exports.AssignConversationHandler = AssignConversationHandler = AssignConversationHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(assign_conversation_command_1.AssignConversationCommand),
    __metadata("design:paramtypes", [wa_conversation_service_1.WaConversationService])
], AssignConversationHandler);
//# sourceMappingURL=assign-conversation.handler.js.map