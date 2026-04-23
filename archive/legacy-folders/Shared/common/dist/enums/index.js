"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = exports.EntityType = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["MANAGER"] = "MANAGER";
    UserRole["USER"] = "USER";
    UserRole["VIEWER"] = "VIEWER";
})(UserRole || (exports.UserRole = UserRole = {}));
var EntityType;
(function (EntityType) {
    EntityType["LEAD"] = "lead";
    EntityType["CONTACT"] = "contact";
    EntityType["ORGANIZATION"] = "organization";
    EntityType["QUOTATION"] = "quotation";
    EntityType["ORDER"] = "order";
    EntityType["INVOICE"] = "invoice";
    EntityType["PRODUCT"] = "product";
})(EntityType || (exports.EntityType = EntityType = {}));
var Status;
(function (Status) {
    Status["ACTIVE"] = "ACTIVE";
    Status["INACTIVE"] = "INACTIVE";
    Status["DELETED"] = "DELETED";
    Status["DRAFT"] = "DRAFT";
    Status["ARCHIVED"] = "ARCHIVED";
})(Status || (exports.Status = Status = {}));
//# sourceMappingURL=index.js.map