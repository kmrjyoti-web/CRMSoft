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
var LinkEmailToEntityHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkEmailToEntityHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const link_email_to_entity_command_1 = require("./link-email-to-entity.command");
const email_linker_service_1 = require("../../../services/email-linker.service");
let LinkEmailToEntityHandler = LinkEmailToEntityHandler_1 = class LinkEmailToEntityHandler {
    constructor(emailLinker) {
        this.emailLinker = emailLinker;
        this.logger = new common_1.Logger(LinkEmailToEntityHandler_1.name);
    }
    async execute(cmd) {
        try {
            await this.emailLinker.manualLink(cmd.emailId, cmd.entityType, cmd.entityId);
            this.logger.log(`Email ${cmd.emailId} linked to ${cmd.entityType}:${cmd.entityId} by user ${cmd.userId}`);
        }
        catch (error) {
            this.logger.error(`LinkEmailToEntityHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.LinkEmailToEntityHandler = LinkEmailToEntityHandler;
exports.LinkEmailToEntityHandler = LinkEmailToEntityHandler = LinkEmailToEntityHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(link_email_to_entity_command_1.LinkEmailToEntityCommand),
    __metadata("design:paramtypes", [email_linker_service_1.EmailLinkerService])
], LinkEmailToEntityHandler);
//# sourceMappingURL=link-email-to-entity.handler.js.map