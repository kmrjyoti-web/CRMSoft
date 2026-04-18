"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ListPortalUsersHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListPortalUsersHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const list_portal_users_query_1 = require("./list-portal-users.query");
const customer_user_repository_interface_1 = require("../../../domain/interfaces/customer-user.repository.interface");
let ListPortalUsersHandler = ListPortalUsersHandler_1 = class ListPortalUsersHandler {
    constructor(userRepo) {
        this.userRepo = userRepo;
        this.logger = new common_1.Logger(ListPortalUsersHandler_1.name);
    }
    async execute(query) {
        try {
            const { tenantId, page, limit, search, isActive } = query;
            return this.userRepo.findAllByTenant(tenantId, { page, limit, search, isActive });
        }
        catch (error) {
            this.logger.error(`ListPortalUsersHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ListPortalUsersHandler = ListPortalUsersHandler;
exports.ListPortalUsersHandler = ListPortalUsersHandler = ListPortalUsersHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(list_portal_users_query_1.ListPortalUsersQuery),
    __param(0, (0, common_1.Inject)(customer_user_repository_interface_1.CUSTOMER_USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], ListPortalUsersHandler);
//# sourceMappingURL=list-portal-users.handler.js.map