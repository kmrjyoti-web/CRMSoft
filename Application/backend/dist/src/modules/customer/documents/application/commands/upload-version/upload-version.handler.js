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
var UploadVersionHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadVersionHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const upload_version_command_1 = require("./upload-version.command");
const storage_local_service_1 = require("../../../services/storage-local.service");
const document_service_1 = require("../../../services/document.service");
const document_activity_service_1 = require("../../../services/document-activity.service");
const working_client_1 = require("@prisma/working-client");
let UploadVersionHandler = UploadVersionHandler_1 = class UploadVersionHandler {
    constructor(storage, documentService, activityService) {
        this.storage = storage;
        this.documentService = documentService;
        this.activityService = activityService;
        this.logger = new common_1.Logger(UploadVersionHandler_1.name);
    }
    async execute(command) {
        try {
            const uploadResult = await this.storage.saveFile(command.file);
            const version = await this.documentService.createVersion(command.parentDocumentId, {
                fileName: uploadResult.fileName,
                originalName: uploadResult.originalName,
                mimeType: uploadResult.mimeType,
                fileSize: uploadResult.fileSize,
                storageType: working_client_1.StorageType.LOCAL,
                storagePath: uploadResult.storagePath,
                uploadedById: command.userId,
            });
            await this.activityService.log({
                documentId: command.parentDocumentId,
                action: 'VERSION_CREATED',
                userId: command.userId,
                details: { newVersionId: version.id, version: version.version },
            });
            return version;
        }
        catch (error) {
            this.logger.error(`UploadVersionHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UploadVersionHandler = UploadVersionHandler;
exports.UploadVersionHandler = UploadVersionHandler = UploadVersionHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(upload_version_command_1.UploadVersionCommand),
    __metadata("design:paramtypes", [storage_local_service_1.StorageLocalService,
        document_service_1.DocumentService,
        document_activity_service_1.DocumentActivityService])
], UploadVersionHandler);
//# sourceMappingURL=upload-version.handler.js.map