"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListOffersQuery = void 0;
class ListOffersQuery {
    constructor(tenantId, page = 1, limit = 20, status, offerType, authorId) {
        this.tenantId = tenantId;
        this.page = page;
        this.limit = limit;
        this.status = status;
        this.offerType = offerType;
        this.authorId = authorId;
    }
}
exports.ListOffersQuery = ListOffersQuery;
//# sourceMappingURL=list-offers.query.js.map