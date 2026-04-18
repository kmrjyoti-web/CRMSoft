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
var GetEntityDocumentsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetEntityDocumentsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_entity_documents_query_1 = require("./get-entity-documents.query");
const attachment_service_1 = require("../../../services/attachment.service");
let GetEntityDocumentsHandler = GetEntityDocumentsHandler_1 = class GetEntityDocumentsHandler {
    constructor(attachmentService) {
        this.attachmentService = attachmentService;
        this.logger = new common_1.Logger(GetEntityDocumentsHandler_1.name);
    }
    async execute(query) {
        try {
            return this.attachmentService.getEntityDocuments(query.entityType, query.entityId, query.page, query.limit);
        }
        catch (error) {
            this.logger.error(`GetEntityDocumentsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetEntityDocumentsHandler = GetEntityDocumentsHandler;
exports.GetEntityDocumentsHandler = GetEntityDocumentsHandler = GetEntityDocumentsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_entity_documents_query_1.GetEntityDocumentsQuery),
    __metadata("design:paramtypes", [attachment_service_1.AttachmentService])
], GetEntityDocumentsHandler);
//# sourceMappingURL=get-entity-documents.handler.js.map