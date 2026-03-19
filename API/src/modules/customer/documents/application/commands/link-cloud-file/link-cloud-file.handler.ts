import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { LinkCloudFileCommand } from './link-cloud-file.command';
import { CloudLinkParserService } from '../../../services/cloud-link-parser.service';
import { CloudProviderService } from '../../../services/cloud-provider.service';
import { DocumentService } from '../../../services/document.service';
import { DocumentActivityService } from '../../../services/document-activity.service';
import { StorageType } from '@prisma/working-client';

@CommandHandler(LinkCloudFileCommand)
export class LinkCloudFileHandler implements ICommandHandler<LinkCloudFileCommand> {
  constructor(
    private readonly linkParser: CloudLinkParserService,
    private readonly cloudProvider: CloudProviderService,
    private readonly documentService: DocumentService,
    private readonly activityService: DocumentActivityService,
  ) {}

  async execute(command: LinkCloudFileCommand) {
    const parsed = this.linkParser.parseUrl(command.url);
    if (!parsed) {
      throw new BadRequestException('Unable to parse cloud URL. Supported: Google Drive, OneDrive, Dropbox');
    }

    // Try to get metadata from cloud provider
    let metadata;
    try {
      metadata = await this.cloudProvider.getFileMetadata(command.userId, parsed.provider, parsed.fileId);
    } catch {
      // If no connection, create with basic info
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
      storageType: StorageType.CLOUD_LINK,
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
}
