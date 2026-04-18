"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListListingsQuery = void 0;
class ListListingsQuery {
    constructor(tenantId, page = 1, limit = 20, status, listingType, categoryId, search, authorId) {
        this.tenantId = tenantId;
        this.page = page;
        this.limit = limit;
        this.status = status;
        this.listingType = listingType;
        this.categoryId = categoryId;
        this.search = search;
        this.authorId = authorId;
    }
}
exports.ListListingsQuery = ListListingsQuery;
//# sourceMappingURL=list-listings.query.js.map