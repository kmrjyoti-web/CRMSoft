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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkCloudFileHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const link_cloud_file_command_1 = require("./link-cloud-file.command");
const cloud_link_parser_service_1 = require("../../../services/cloud-link-parser.service");
const cloud_provider_service_1 = require("../../../services/cloud-provider.service");
const document_service_1 = require("../../../services/document.service");
const document_activity_service_1 = require("../../../services/document-activity.service");
const working_client_1 = require("@prisma/working-client");
let LinkCloudFileHandler = class LinkCloudFileHandler {
    constructor(linkParser, cloudProvider, documentService, activityService) {
        this.linkParser = linkParser;
        this.cloudProvider = cloudProvider;
        this.documentService = documentService;
        this.activityService = activityService;
    }
    async execute(command) {
        const parsed = this.linkParser.parseUrl(command.url);
        if (!parsed) {
            throw new common_1.BadRequestException('Unable to parse cloud URL. Supported: Google Drive, OneDrive, Dropbox');
        }
        let metadata;
        try {
            metadata = await this.cloudProvider.getFileMetadata(command.userId, parsed.provider, parsed.fileId);
        }
        catch {
            metadata = {
                fileId: parsed.fileId,
                fileName: parsed.fileName || `cloud-file-${parsed.fileId}`,
                mimeType: parsed.fileName
                    ? this.linkParser.getMimeTypeFromExtension(parsed.fileName)
                    : 'application/octet-stream',
                fileSize: 0,
                webViewUrl: command.url,
            };
        }
        const doc = await this.documentService.createDocument({
            fileName: metadata.fileName,
            originalName: metadata.fileName,
            mimeType: metadata.mimeType,
            fileSize: metadata.fileSize,
            storageType: working_client_1.StorageType.CLOUD_LINK,
            storageProvider: parsed.provider,
            storageUrl: metadata.webViewUrl || command.url,
            cloudFileId: parsed.fileId,
            thumbnailUrl: metadata.thumbnailUrl,
            category: command.category || this.documentService.categorizeByMimeType(metadata.mimeType),
            description: command.description,
            tags: command.tags,
            folderId: command.folderId,
            uploadedById: command.userId,
        });
        await this.activityService.log({
            documentId: doc.id,
            action: 'UPLOADED',
            userId: command.userId,
            details: { provider: parsed.provider, cloudFileId: parsed.fileId, url: command.url },
        });
        return doc;
    }
};
exports.LinkCloudFileHandler = LinkCloudFileHandler;
exports.LinkCloudFileHandler = LinkCloudFileHandler = __decorate([
    (0, cqrs_1.CommandHandler)(link_cloud_file_command_1.LinkCloudFileCommand),
    __metadata("design:paramtypes", [cloud_link_parser_service_1.CloudLinkParserService,
        cloud_provider_service_1.CloudProviderService,
        document_service_1.DocumentService,
        document_activity_service_1.DocumentActivityService])
], LinkCloudFileHandler);
//# sourceMappingURL=link-cloud-file.handler.js.map