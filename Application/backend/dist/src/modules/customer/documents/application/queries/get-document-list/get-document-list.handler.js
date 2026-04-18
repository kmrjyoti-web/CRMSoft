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
var GetDocumentListHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDocumentListHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_document_list_query_1 = require("./get-document-list.query");
const document_service_1 = require("../../../services/document.service");
let GetDocumentListHandler = GetDocumentListHandler_1 = class GetDocumentListHandler {
    constructor(documentService) {
        this.documentService = documentService;
        this.logger = new common_1.Logger(GetDocumentListHandler_1.name);
    }
    async execute(query) {
        try {
            return this.documentService.getList({
                page: query.page,
                limit: query.limit,
                search: query.search,
                category: query.category,
                storageType: query.storageType,
                folderId: query.folderId,
                uploadedById: query.uploadedById,
                tags: query.tags,
            });
        }
        catch (error) {
            this.logger.error(`GetDocumentListHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetDocumentListHandler = GetDocumentListHandler;
exports.GetDocumentListHandler = GetDocumentListHandler = GetDocumentListHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_document_list_query_1.GetDocumentListQuery),
    __metadata("design:paramtypes", [document_service_1.DocumentService])
], GetDocumentListHandler);
//# sourceMappingURL=get-document-list.handler.js.map