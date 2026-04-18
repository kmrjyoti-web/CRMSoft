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
var SearchDocumentsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchDocumentsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const search_documents_query_1 = require("./search-documents.query");
const search_service_1 = require("../../../services/search.service");
let SearchDocumentsHandler = SearchDocumentsHandler_1 = class SearchDocumentsHandler {
    constructor(searchService) {
        this.searchService = searchService;
        this.logger = new common_1.Logger(SearchDocumentsHandler_1.name);
    }
    async execute(query) {
        try {
            return this.searchService.search({
                query: query.query,
                page: query.page,
                limit: query.limit,
                category: query.category,
                storageType: query.storageType,
                tags: query.tags,
                uploadedById: query.uploadedById,
                dateFrom: query.dateFrom,
                dateTo: query.dateTo,
                mimeType: query.mimeType,
                minSize: query.minSize,
                maxSize: query.maxSize,
            });
        }
        catch (error) {
            this.logger.error(`SearchDocumentsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SearchDocumentsHandler = SearchDocumentsHandler;
exports.SearchDocumentsHandler = SearchDocumentsHandler = SearchDocumentsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(search_documents_query_1.SearchDocumentsQuery),
    __metadata("design:paramtypes", [search_service_1.DocumentSearchService])
], SearchDocumentsHandler);
//# sourceMappingURL=search-documents.handler.js.map