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
var GetDocumentVersionsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDocumentVersionsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_document_versions_query_1 = require("./get-document-versions.query");
const document_service_1 = require("../../../services/document.service");
let GetDocumentVersionsHandler = GetDocumentVersionsHandler_1 = class GetDocumentVersionsHandler {
    constructor(documentService) {
        this.documentService = documentService;
        this.logger = new common_1.Logger(GetDocumentVersionsHandler_1.name);
    }
    async execute(query) {
        try {
            return this.documentService.getVersions(query.documentId);
        }
        catch (error) {
            this.logger.error(`GetDocumentVersionsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetDocumentVersionsHandler = GetDocumentVersionsHandler;
exports.GetDocumentVersionsHandler = GetDocumentVersionsHandler = GetDocumentVersionsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_document_versions_query_1.GetDocumentVersionsQuery),
    __metadata("design:paramtypes", [document_service_1.DocumentService])
], GetDocumentVersionsHandler);
//# sourceMappingURL=get-document-versions.handler.js.map