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
var AttachDocumentHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachDocumentHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const attach_document_command_1 = require("./attach-document.command");
const attachment_service_1 = require("../../../services/attachment.service");
const document_activity_service_1 = require("../../../services/document-activity.service");
let AttachDocumentHandler = AttachDocumentHandler_1 = class AttachDocumentHandler {
    constructor(attachmentService, activityService) {
        this.attachmentService = attachmentService;
        this.activityService = activityService;
        this.logger = new common_1.Logger(AttachDocumentHandler_1.name);
    }
    async execute(command) {
        try {
            const result = await this.attachmentService.attachDocument(command.documentId, command.entityType, command.entityId, command.userId);
            await this.activityService.log({
                documentId: command.documentId,
                action: 'ATTACHED',
                userId: command.userId,
                details: { entityType: command.entityType, entityId: command.entityId },
            });
            return result;
        }
        catch (error) {
            this.logger.error(`AttachDocumentHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.AttachDocumentHandler = AttachDocumentHandler;
exports.AttachDocumentHandler = AttachDocumentHandler = AttachDocumentHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(attach_document_command_1.AttachDocumentCommand),
    __metadata("design:paramtypes", [attachment_service_1.AttachmentService,
        document_activity_service_1.DocumentActivityService])
], AttachDocumentHandler);
//# sourceMappingURL=attach-document.handler.js.map