"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListSavedFiltersQuery = void 0;
class ListSavedFiltersQuery {
    constructor(userId, entityType, search, page = 1, limit = 50) {
        this.userId = userId;
        this.entityType = entityType;
        this.search = search;
        this.page = page;
        this.limit = limit;
    }
}
exports.ListSavedFiltersQuery = ListSavedFiltersQuery;
//# sourceMappingURL=list-saved-filters.query.js.map