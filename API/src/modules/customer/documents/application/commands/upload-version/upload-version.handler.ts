import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadVersionCommand } from './upload-version.command';
import { StorageLocalService } from '../../../services/storage-local.service';
import { DocumentService } from '../../../services/document.service';
import { DocumentActivityService } from '../../../services/document-activity.service';
import { StorageType } from '@prisma/working-client';

@CommandHandler(UploadVersionCommand)
export class UploadVersionHandler implements ICommandHandler<UploadVersionCommand> {
  constructor(
    private readonly storage: StorageLocalService,
    private readonly documentService: DocumentService,
    private readonly activityService: DocumentActivityService,
  ) {}

  async execute(command: UploadVersionCommand) {
    const uploadResult = await this.storage.saveFile(command.file);

    const version = await this.documentService.createVersion(command.parentDocumentId, {
      fileName: uploadResult.fileName,
      originalName: uploadResult.originalName,
      mimeType: uploadResult.mimeType,
      fileSize: uploadResult.fileSize,
      storageType: StorageType.LOCAL,
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
}
