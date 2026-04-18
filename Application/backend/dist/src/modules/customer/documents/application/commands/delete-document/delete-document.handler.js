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
var DeleteDocumentHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteDocumentHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const delete_document_command_1 = require("./delete-document.command");
const document_service_1 = require("../../../services/document.service");
const document_activity_service_1 = require("../../../services/document-activity.service");
let DeleteDocumentHandler = DeleteDocumentHandler_1 = class DeleteDocumentHandler {
    constructor(documentService, activityService) {
        this.documentService = documentService;
        this.activityService = activityService;
        this.logger = new common_1.Logger(DeleteDocumentHandler_1.name);
    }
    async execute(command) {
        try {
            await this.documentService.softDelete(command.id);
            await this.activityService.log({
                documentId: command.id,
                action: 'DELETED',
                userId: command.userId,
            });
            return { success: true };
        }
        catch (error) {
            this.logger.error(`DeleteDocumentHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeleteDocumentHandler = DeleteDocumentHandler;
exports.DeleteDocumentHandler = DeleteDocumentHandler = DeleteDocumentHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(delete_document_command_1.DeleteDocumentCommand),
    __metadata("design:paramtypes", [document_service_1.DocumentService,
        document_activity_service_1.DocumentActivityService])
], DeleteDocumentHandler);
//# sourceMappingURL=delete-document.handler.js.map