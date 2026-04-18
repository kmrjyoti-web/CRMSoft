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
var LinkConversationToEntityHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkConversationToEntityHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const link_conversation_to_entity_command_1 = require("./link-conversation-to-entity.command");
const wa_entity_linker_service_1 = require("../../../services/wa-entity-linker.service");
let LinkConversationToEntityHandler = LinkConversationToEntityHandler_1 = class LinkConversationToEntityHandler {
    constructor(waEntityLinkerService) {
        this.waEntityLinkerService = waEntityLinkerService;
        this.logger = new common_1.Logger(LinkConversationToEntityHandler_1.name);
    }
    async execute(command) {
        try {
            await this.waEntityLinkerService.manualLink(command.conversationId, command.entityType, command.entityId);
            this.logger.log(`Conversation ${command.conversationId} linked to ${command.entityType}:${command.entityId} by user ${command.userId}`);
        }
        catch (error) {
            this.logger.error(`LinkConversationToEntityHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.LinkConversationToEntityHandler = LinkConversationToEntityHandler;
exports.LinkConversationToEntityHandler = LinkConversationToEntityHandler = LinkConversationToEntityHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(link_conversation_to_entity_command_1.LinkConversationToEntityCommand),
    __metadata("design:paramtypes", [wa_entity_linker_service_1.WaEntityLinkerService])
], LinkConversationToEntityHandler);
//# sourceMappingURL=link-conversation-to-entity.handler.js.map