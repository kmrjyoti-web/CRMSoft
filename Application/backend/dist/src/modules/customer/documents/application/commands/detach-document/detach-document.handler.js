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
var DetachDocumentHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetachDocumentHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const detach_document_command_1 = require("./detach-document.command");
const attachment_service_1 = require("../../../services/attachment.service");
const document_activity_service_1 = require("../../../services/document-activity.service");
let DetachDocumentHandler = DetachDocumentHandler_1 = class DetachDocumentHandler {
    constructor(attachmentService, activityService) {
        this.attachmentService = attachmentService;
        this.activityService = activityService;
        this.logger = new common_1.Logger(DetachDocumentHandler_1.name);
    }
    async execute(command) {
        try {
            await this.attachmentService.detachDocument(command.documentId, command.entityType, command.entityId);
            await this.activityService.log({
                documentId: command.documentId,
                action: 'DETACHED',
                userId: command.userId,
                details: { entityType: command.entityType, entityId: command.entityId },
            });
            return { success: true };
        }
        catch (error) {
            this.logger.error(`DetachDocumentHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DetachDocumentHandler = DetachDocumentHandler;
exports.DetachDocumentHandler = DetachDocumentHandler = DetachDocumentHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(detach_document_command_1.DetachDocumentCommand),
    __metadata("design:paramtypes", [attachment_service_1.AttachmentService,
        document_activity_service_1.DocumentActivityService])
], DetachDocumentHandler);
//# sourceMappingURL=detach-document.handler.js.map