"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchDocumentsQuery = void 0;
class SearchDocumentsQuery {
    constructor(query, page = 1, limit = 20, category, storageType, tags, uploadedById, dateFrom, dateTo, mimeType, minSize, maxSize) {
        this.query = query;
        this.page = page;
        this.limit = limit;
        this.category = category;
        this.storageType = storageType;
        this.tags = tags;
        this.uploadedById = uploadedById;
        this.dateFrom = dateFrom;
        this.dateTo = dateTo;
        this.mimeType = mimeType;
        this.minSize = minSize;
        this.maxSize = maxSize;
    }
}
exports.SearchDocumentsQuery = SearchDocumentsQuery;
//# sourceMappingURL=search-documents.query.js.map