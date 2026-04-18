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
var GetRetentionPoliciesHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRetentionPoliciesHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_retention_policies_query_1 = require("./get-retention-policies.query");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let GetRetentionPoliciesHandler = GetRetentionPoliciesHandler_1 = class GetRetentionPoliciesHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetRetentionPoliciesHandler_1.name);
    }
    async execute(_query) {
        try {
            return this.prisma.identity.auditRetentionPolicy.findMany({
                orderBy: { entityType: 'asc' },
            });
        }
        catch (error) {
            this.logger.error(`GetRetentionPoliciesHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetRetentionPoliciesHandler = GetRetentionPoliciesHandler;
exports.GetRetentionPoliciesHandler = GetRetentionPoliciesHandler = GetRetentionPoliciesHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_retention_policies_query_1.GetRetentionPoliciesQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetRetentionPoliciesHandler);
//# sourceMappingURL=get-retention-policies.handler.js.map