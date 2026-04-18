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
var GetOwnershipHistoryHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOwnershipHistoryHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_ownership_history_query_1 = require("./get-ownership-history.query");
const ownership_core_service_1 = require("../../../services/ownership-core.service");
let GetOwnershipHistoryHandler = GetOwnershipHistoryHandler_1 = class GetOwnershipHistoryHandler {
    constructor(ownershipCore) {
        this.ownershipCore = ownershipCore;
        this.logger = new common_1.Logger(GetOwnershipHistoryHandler_1.name);
    }
    async execute(query) {
        try {
            return this.ownershipCore.getHistory({
                entityType: query.entityType, entityId: query.entityId,
                page: query.page, limit: query.limit,
            });
        }
        catch (error) {
            this.logger.error(`GetOwnershipHistoryHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetOwnershipHistoryHandler = GetOwnershipHistoryHandler;
exports.GetOwnershipHistoryHandler = GetOwnershipHistoryHandler = GetOwnershipHistoryHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_ownership_history_query_1.GetOwnershipHistoryQuery),
    __metadata("design:paramtypes", [ownership_core_service_1.OwnershipCoreService])
], GetOwnershipHistoryHandler);
//# sourceMappingURL=get-ownership-history.handler.js.map