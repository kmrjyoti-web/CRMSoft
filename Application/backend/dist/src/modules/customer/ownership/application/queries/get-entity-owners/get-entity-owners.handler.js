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
var GetEntityOwnersHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetEntityOwnersHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_entity_owners_query_1 = require("./get-entity-owners.query");
const ownership_core_service_1 = require("../../../services/ownership-core.service");
let GetEntityOwnersHandler = GetEntityOwnersHandler_1 = class GetEntityOwnersHandler {
    constructor(ownershipCore) {
        this.ownershipCore = ownershipCore;
        this.logger = new common_1.Logger(GetEntityOwnersHandler_1.name);
    }
    async execute(query) {
        try {
            return this.ownershipCore.getEntityOwners(query.entityType, query.entityId);
        }
        catch (error) {
            this.logger.error(`GetEntityOwnersHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetEntityOwnersHandler = GetEntityOwnersHandler;
exports.GetEntityOwnersHandler = GetEntityOwnersHandler = GetEntityOwnersHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_entity_owners_query_1.GetEntityOwnersQuery),
    __metadata("design:paramtypes", [ownership_core_service_1.OwnershipCoreService])
], GetEntityOwnersHandler);
//# sourceMappingURL=get-entity-owners.handler.js.map