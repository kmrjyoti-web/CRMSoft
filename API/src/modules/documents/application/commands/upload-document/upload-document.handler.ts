import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadDocumentCommand } from './upload-document.command';
import { StorageLocalService } from '../../../services/storage-local.service';
import { DocumentService } from '../../../services/document.service';
import { DocumentActivityService } from '../../../services/document-activity.service';
import { StorageType, DocumentCategory } from '@prisma/client';

@CommandHandler(UploadDocumentCommand)
export class UploadDocumentHandler implements ICommandHandler<UploadDocumentCommand> {
  constructor(
    private readonly storage: StorageLocalService,
    private readonly documentService: DocumentService,
    private readonly activityService: DocumentActivityService,
  ) {}

  async execute(command: UploadDocumentCommand) {
    const uploadResult = await this.storage.saveFile(command.file);

    const category = (command.category as DocumentCategory) ||
      this.documentService.categorizeByMimeType(uploadResult.mimeType);

    const doc = await this.documentService.createDocument({
      fileName: uploadResult.fileName,
      originalName: uploadResult.originalName,
      mimeType: uploadResult.mimeType,
      fileSize: uploadResult.fileSize,
      storageType: StorageType.LOCAL,
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
}
