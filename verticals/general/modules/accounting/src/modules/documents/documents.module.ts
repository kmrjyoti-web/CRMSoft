import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MulterModule } from '@nestjs/platform-express';

// Services
import { StorageLocalService } from './services/storage-local.service';
import { CloudLinkParserService } from './services/cloud-link-parser.service';
import { CloudProviderService } from './services/cloud-provider.service';
import { DocumentService } from './services/document.service';
import { AttachmentService } from './services/attachment.service';
import { FolderService } from './services/folder.service';
import { ShareLinkService } from './services/share-link.service';
import { DocumentActivityService } from './services/document-activity.service';
import { DocumentSearchService } from './services/search.service';

// Command Handlers
import { UploadDocumentHandler } from './application/commands/upload-document/upload-document.handler';
import { UpdateDocumentHandler } from './application/commands/update-document/update-document.handler';
import { DeleteDocumentHandler } from './application/commands/delete-document/delete-document.handler';
import { MoveDocumentHandler } from './application/commands/move-document/move-document.handler';
import { CreateFolderHandler } from './application/commands/create-folder/create-folder.handler';
import { UpdateFolderHandler } from './application/commands/update-folder/update-folder.handler';
import { DeleteFolderHandler } from './application/commands/delete-folder/delete-folder.handler';
import { AttachDocumentHandler } from './application/commands/attach-document/attach-document.handler';
import { DetachDocumentHandler } from './application/commands/detach-document/detach-document.handler';
import { UploadVersionHandler } from './application/commands/upload-version/upload-version.handler';
import { CreateShareLinkHandler } from './application/commands/create-share-link/create-share-link.handler';
import { RevokeShareLinkHandler } from './application/commands/revoke-share-link/revoke-share-link.handler';
import { ConnectCloudHandler } from './application/commands/connect-cloud/connect-cloud.handler';
import { DisconnectCloudHandler } from './application/commands/disconnect-cloud/disconnect-cloud.handler';
import { LinkCloudFileHandler } from './application/commands/link-cloud-file/link-cloud-file.handler';

// Query Handlers
import { GetDocumentListHandler } from './application/queries/get-document-list/get-document-list.handler';
import { GetDocumentByIdHandler } from './application/queries/get-document-by-id/get-document-by-id.handler';
import { GetDocumentVersionsHandler } from './application/queries/get-document-versions/get-document-versions.handler';
import { GetEntityDocumentsHandler } from './application/queries/get-entity-documents/get-entity-documents.handler';
import { GetFolderTreeHandler } from './application/queries/get-folder-tree/get-folder-tree.handler';
import { GetFolderContentsHandler } from './application/queries/get-folder-contents/get-folder-contents.handler';
import { GetShareLinkHandler } from './application/queries/get-share-link/get-share-link.handler';
import { GetCloudConnectionsHandler } from './application/queries/get-cloud-connections/get-cloud-connections.handler';
import { SearchDocumentsHandler } from './application/queries/search-documents/search-documents.handler';
import { GetDocumentStatsHandler } from './application/queries/get-document-stats/get-document-stats.handler';
import { GetDocumentActivityHandler } from './application/queries/get-document-activity/get-document-activity.handler';

// Controllers
import { DocumentController } from './presentation/document.controller';
import { FolderController } from './presentation/folder.controller';
import { AttachmentController } from './presentation/attachment.controller';
import { ShareLinkController } from './presentation/share-link.controller';
import { CloudController } from './presentation/cloud.controller';

const CommandHandlers = [
  UploadDocumentHandler,
  UpdateDocumentHandler,
  DeleteDocumentHandler,
  MoveDocumentHandler,
  CreateFolderHandler,
  UpdateFolderHandler,
  DeleteFolderHandler,
  AttachDocumentHandler,
  DetachDocumentHandler,
  UploadVersionHandler,
  CreateShareLinkHandler,
  RevokeShareLinkHandler,
  ConnectCloudHandler,
  DisconnectCloudHandler,
  LinkCloudFileHandler,
];

const QueryHandlers = [
  GetDocumentListHandler,
  GetDocumentByIdHandler,
  GetDocumentVersionsHandler,
  GetEntityDocumentsHandler,
  GetFolderTreeHandler,
  GetFolderContentsHandler,
  GetShareLinkHandler,
  GetCloudConnectionsHandler,
  SearchDocumentsHandler,
  GetDocumentStatsHandler,
  GetDocumentActivityHandler,
];

@Module({
  imports: [
    CqrsModule,
    MulterModule.register({ storage: undefined }),
  ],
  controllers: [
    DocumentController,
    FolderController,
    AttachmentController,
    ShareLinkController,
    CloudController,
  ],
  providers: [
    // Services
    StorageLocalService,
    CloudLinkParserService,
    CloudProviderService,
    DocumentService,
    AttachmentService,
    FolderService,
    ShareLinkService,
    DocumentActivityService,
    DocumentSearchService,
    // CQRS
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [
    DocumentService,
    AttachmentService,
    StorageLocalService,
  ],
})
export class DocumentsModule {}
