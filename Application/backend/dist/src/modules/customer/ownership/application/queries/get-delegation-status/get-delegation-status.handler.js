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
var GetDelegationStatusHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDelegationStatusHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_delegation_status_query_1 = require("./get-delegation-status.query");
const delegation_service_1 = require("../../../services/delegation.service");
let GetDelegationStatusHandler = GetDelegationStatusHandler_1 = class GetDelegationStatusHandler {
    constructor(delegation) {
        this.delegation = delegation;
        this.logger = new common_1.Logger(GetDelegationStatusHandler_1.name);
    }
    async execute(query) {
        try {
            return this.delegation.getDelegationStatus({ userId: query.userId, isActive: query.isActive });
        }
        catch (error) {
            this.logger.error(`GetDelegationStatusHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetDelegationStatusHandler = GetDelegationStatusHandler;
exports.GetDelegationStatusHandler = GetDelegationStatusHandler = GetDelegationStatusHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_delegation_status_query_1.GetDelegationStatusQuery),
    __metadata("design:paramtypes", [delegation_service_1.DelegationService])
], GetDelegationStatusHandler);
//# sourceMappingURL=get-delegation-status.handler.js.map