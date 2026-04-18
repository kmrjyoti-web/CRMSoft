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
var GetUserEntitiesHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserEntitiesHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_user_entities_query_1 = require("./get-user-entities.query");
const ownership_core_service_1 = require("../../../services/ownership-core.service");
let GetUserEntitiesHandler = GetUserEntitiesHandler_1 = class GetUserEntitiesHandler {
    constructor(ownershipCore) {
        this.ownershipCore = ownershipCore;
        this.logger = new common_1.Logger(GetUserEntitiesHandler_1.name);
    }
    async execute(query) {
        try {
            return this.ownershipCore.getUserEntities({
                userId: query.userId, entityType: query.entityType,
                ownerType: query.ownerType, isActive: query.isActive,
            });
        }
        catch (error) {
            this.logger.error(`GetUserEntitiesHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetUserEntitiesHandler = GetUserEntitiesHandler;
exports.GetUserEntitiesHandler = GetUserEntitiesHandler = GetUserEntitiesHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_user_entities_query_1.GetUserEntitiesQuery),
    __metadata("design:paramtypes", [ownership_core_service_1.OwnershipCoreService])
], GetUserEntitiesHandler);
//# sourceMappingURL=get-user-entities.handler.js.map