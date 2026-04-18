"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListEnquiriesQuery = void 0;
class ListEnquiriesQuery {
    constructor(tenantId, listingId, enquirerId, status, page = 1, limit = 20) {
        this.tenantId = tenantId;
        this.listingId = listingId;
        this.enquirerId = enquirerId;
        this.status = status;
        this.page = page;
        this.limit = limit;
    }
}
exports.ListEnquiriesQuery = ListEnquiriesQuery;
//# sourceMappingURL=list-enquiries.query.js.map