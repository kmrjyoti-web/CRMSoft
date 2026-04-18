"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListRequirementsQuery = void 0;
class ListRequirementsQuery {
    constructor(tenantId, page = 1, limit = 20, categoryId, authorId, search) {
        this.tenantId = tenantId;
        this.page = page;
        this.limit = limit;
        this.categoryId = categoryId;
        this.authorId = authorId;
        this.search = search;
    }
}
exports.ListRequirementsQuery = ListRequirementsQuery;
//# sourceMappingURL=list-requirements.query.js.map