"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListProductsQuery = void 0;
class ListProductsQuery {
    constructor(page, limit, sortBy, sortDir, search, status, parentId, isMaster, brandId, manufacturerId, minPrice, maxPrice, taxType, licenseRequired, tags) {
        this.page = page;
        this.limit = limit;
        this.sortBy = sortBy;
        this.sortDir = sortDir;
        this.search = search;
        this.status = status;
        this.parentId = parentId;
        this.isMaster = isMaster;
        this.brandId = brandId;
        this.manufacturerId = manufacturerId;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.taxType = taxType;
        this.licenseRequired = licenseRequired;
        this.tags = tags;
    }
}
exports.ListProductsQuery = ListProductsQuery;
//# sourceMappingURL=list-products.query.js.map