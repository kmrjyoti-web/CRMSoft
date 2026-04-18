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
var GetPendingHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPendingHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_pending_query_1 = require("./get-pending.query");
const maker_checker_engine_1 = require("../../../../../../core/permissions/engines/maker-checker.engine");
const cross_service_decorator_1 = require("../../../../../../common/decorators/cross-service.decorator");
let GetPendingHandler = GetPendingHandler_1 = class GetPendingHandler {
    constructor(makerChecker) {
        this.makerChecker = makerChecker;
        this.logger = new common_1.Logger(GetPendingHandler_1.name);
    }
    async execute(query) {
        try {
            return this.makerChecker.getPendingForRole(query.checkerRole);
        }
        catch (error) {
            this.logger.error(`GetPendingHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetPendingHandler = GetPendingHandler;
exports.GetPendingHandler = GetPendingHandler = GetPendingHandler_1 = __decorate([
    (0, cross_service_decorator_1.CrossService)('identity', 'Uses MakerCheckerEngine from core/permissions to validate and record maker-checker decisions'),
    (0, cqrs_1.QueryHandler)(get_pending_query_1.GetPendingQuery),
    __metadata("design:paramtypes", [maker_checker_engine_1.MakerCheckerEngine])
], GetPendingHandler);
//# sourceMappingURL=get-pending.handler.js.map