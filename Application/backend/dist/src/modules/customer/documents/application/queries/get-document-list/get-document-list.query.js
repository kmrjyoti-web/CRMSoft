"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDocumentListQuery = void 0;
class GetDocumentListQuery {
    constructor(page = 1, limit = 20, search, category, storageType, folderId, uploadedById, tags) {
        this.page = page;
        this.limit = limit;
        this.search = search;
        this.category = category;
        this.storageType = storageType;
        this.folderId = folderId;
        this.uploadedById = uploadedById;
        this.tags = tags;
    }
}
exports.GetDocumentListQuery = GetDocumentListQuery;
//# sourceMappingURL=get-document-list.query.js.map