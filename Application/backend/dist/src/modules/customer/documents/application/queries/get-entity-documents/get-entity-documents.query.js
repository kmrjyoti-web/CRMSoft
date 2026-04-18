"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetEntityDocumentsQuery = void 0;
class GetEntityDocumentsQuery {
    constructor(entityType, entityId, page = 1, limit = 20) {
        this.entityType = entityType;
        this.entityId = entityId;
        this.page = page;
        this.limit = limit;
    }
}
exports.GetEntityDocumentsQuery = GetEntityDocumentsQuery;
//# sourceMappingURL=get-entity-documents.query.js.map