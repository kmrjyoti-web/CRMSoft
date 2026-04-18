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
var UploadDocumentHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadDocumentHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const upload_document_command_1 = require("./upload-document.command");
const storage_local_service_1 = require("../../../services/storage-local.service");
const document_service_1 = require("../../../services/document.service");
const document_activity_service_1 = require("../../../services/document-activity.service");
const working_client_1 = require("@prisma/working-client");
let UploadDocumentHandler = UploadDocumentHandler_1 = class UploadDocumentHandler {
    constructor(storage, documentService, activityService) {
        this.storage = storage;
        this.documentService = documentService;
        this.activityService = activityService;
        this.logger = new common_1.Logger(UploadDocumentHandler_1.name);
    }
    async execute(command) {
        try {
            const uploadResult = await this.storage.saveFile(command.file);
            const category = command.category ||
                this.documentService.categorizeByMimeType(uploadResult.mimeType);
            const doc = await this.documentService.createDocument({
                fileName: uploadResult.fileName,
                originalName: uploadResult.originalName,
                mimeType: uploadResult.mimeType,
                fileSize: uploadResult.fileSize,
                storageType: working_client_1.StorageType.LOCAL,
                storagePath: uploadResult.storagePath,
                category,
                description: command.description,
                tags: command.tags,
                folderId: command.folderId,
                uploadedById: command.userId,
            });
            await this.activityService.log({
                documentId: doc.id,
                action: 'UPLOADED',
                userId: command.userId,
                details: { fileName: uploadResult.originalName, fileSize: uploadResult.fileSize },
            });
            return doc;
        }
        catch (error) {
            this.logger.error(`UploadDocumentHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UploadDocumentHandler = UploadDocumentHandler;
exports.UploadDocumentHandler = UploadDocumentHandler = UploadDocumentHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(upload_document_command_1.UploadDocumentCommand),
    __metadata("design:paramtypes", [storage_local_service_1.StorageLocalService,
        document_service_1.DocumentService,
        document_activity_service_1.DocumentActivityService])
], UploadDocumentHandler);
//# sourceMappingURL=upload-document.handler.js.map