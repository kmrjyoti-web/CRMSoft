"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const platform_express_1 = require("@nestjs/platform-express");
const storage_local_service_1 = require("./services/storage-local.service");
const cloud_link_parser_service_1 = require("./services/cloud-link-parser.service");
const cloud_provider_service_1 = require("./services/cloud-provider.service");
const document_service_1 = require("./services/document.service");
const attachment_service_1 = require("./services/attachment.service");
const folder_service_1 = require("./services/folder.service");
const share_link_service_1 = require("./services/share-link.service");
const document_activity_service_1 = require("./services/document-activity.service");
const search_service_1 = require("./services/search.service");
const upload_document_handler_1 = require("./application/commands/upload-document/upload-document.handler");
const update_document_handler_1 = require("./application/commands/update-document/update-document.handler");
const delete_document_handler_1 = require("./application/commands/delete-document/delete-document.handler");
const move_document_handler_1 = require("./application/commands/move-document/move-document.handler");
const create_folder_handler_1 = require("./application/commands/create-folder/create-folder.handler");
const update_folder_handler_1 = require("./application/commands/update-folder/update-folder.handler");
const delete_folder_handler_1 = require("./application/commands/delete-folder/delete-folder.handler");
const attach_document_handler_1 = require("./application/commands/attach-document/attach-document.handler");
const detach_document_handler_1 = require("./application/commands/detach-document/detach-document.handler");
const upload_version_handler_1 = require("./application/commands/upload-version/upload-version.handler");
const create_share_link_handler_1 = require("./application/commands/create-share-link/create-share-link.handler");
const revoke_share_link_handler_1 = require("./application/commands/revoke-share-link/revoke-share-link.handler");
const connect_cloud_handler_1 = require("./application/commands/connect-cloud/connect-cloud.handler");
const disconnect_cloud_handler_1 = require("./application/commands/disconnect-cloud/disconnect-cloud.handler");
const link_cloud_file_handler_1 = require("./application/commands/link-cloud-file/link-cloud-file.handler");
const get_document_list_handler_1 = require("./application/queries/get-document-list/get-document-list.handler");
const get_document_by_id_handler_1 = require("./application/queries/get-document-by-id/get-document-by-id.handler");
const get_document_versions_handler_1 = require("./application/queries/get-document-versions/get-document-versions.handler");
const get_entity_documents_handler_1 = require("./application/queries/get-entity-documents/get-entity-documents.handler");
const get_folder_tree_handler_1 = require("./application/queries/get-folder-tree/get-folder-tree.handler");
const get_folder_contents_handler_1 = require("./application/queries/get-folder-contents/get-folder-contents.handler");
const get_share_link_handler_1 = require("./application/queries/get-share-link/get-share-link.handler");
const get_cloud_connections_handler_1 = require("./application/queries/get-cloud-connections/get-cloud-connections.handler");
const search_documents_handler_1 = require("./application/queries/search-documents/search-documents.handler");
const get_document_stats_handler_1 = require("./application/queries/get-document-stats/get-document-stats.handler");
const get_document_activity_handler_1 = require("./application/queries/get-document-activity/get-document-activity.handler");
const document_controller_1 = require("./presentation/document.controller");
const folder_controller_1 = require("./presentation/folder.controller");
const attachment_controller_1 = require("./presentation/attachment.controller");
const share_link_controller_1 = require("./presentation/share-link.controller");
const cloud_controller_1 = require("./presentation/cloud.controller");
const CommandHandlers = [
    upload_document_handler_1.UploadDocumentHandler,
    update_document_handler_1.UpdateDocumentHandler,
    delete_document_handler_1.DeleteDocumentHandler,
    move_document_handler_1.MoveDocumentHandler,
    create_folder_handler_1.CreateFolderHandler,
    update_folder_handler_1.UpdateFolderHandler,
    delete_folder_handler_1.DeleteFolderHandler,
    attach_document_handler_1.AttachDocumentHandler,
    detach_document_handler_1.DetachDocumentHandler,
    upload_version_handler_1.UploadVersionHandler,
    create_share_link_handler_1.CreateShareLinkHandler,
    revoke_share_link_handler_1.RevokeShareLinkHandler,
    connect_cloud_handler_1.ConnectCloudHandler,
    disconnect_cloud_handler_1.DisconnectCloudHandler,
    link_cloud_file_handler_1.LinkCloudFileHandler,
];
const QueryHandlers = [
    get_document_list_handler_1.GetDocumentListHandler,
    get_document_by_id_handler_1.GetDocumentByIdHandler,
    get_document_versions_handler_1.GetDocumentVersionsHandler,
    get_entity_documents_handler_1.GetEntityDocumentsHandler,
    get_folder_tree_handler_1.GetFolderTreeHandler,
    get_folder_contents_handler_1.GetFolderContentsHandler,
    get_share_link_handler_1.GetShareLinkHandler,
    get_cloud_connections_handler_1.GetCloudConnectionsHandler,
    search_documents_handler_1.SearchDocumentsHandler,
    get_document_stats_handler_1.GetDocumentStatsHandler,
    get_document_activity_handler_1.GetDocumentActivityHandler,
];
let DocumentsModule = class DocumentsModule {
};
exports.DocumentsModule = DocumentsModule;
exports.DocumentsModule = DocumentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            platform_express_1.MulterModule.register({ storage: undefined }),
        ],
        controllers: [
            document_controller_1.DocumentController,
            folder_controller_1.FolderController,
            attachment_controller_1.AttachmentController,
            share_link_controller_1.ShareLinkController,
            cloud_controller_1.CloudController,
        ],
        providers: [
            storage_local_service_1.StorageLocalService,
            cloud_link_parser_service_1.CloudLinkParserService,
            cloud_provider_service_1.CloudProviderService,
            document_service_1.DocumentService,
            attachment_service_1.AttachmentService,
            folder_service_1.FolderService,
            share_link_service_1.ShareLinkService,
            document_activity_service_1.DocumentActivityService,
            search_service_1.DocumentSearchService,
            ...CommandHandlers,
            ...QueryHandlers,
        ],
        exports: [
            document_service_1.DocumentService,
            attachment_service_1.AttachmentService,
            storage_local_service_1.StorageLocalService,
        ],
    })
], DocumentsModule);
//# sourceMappingURL=documents.module.js.map