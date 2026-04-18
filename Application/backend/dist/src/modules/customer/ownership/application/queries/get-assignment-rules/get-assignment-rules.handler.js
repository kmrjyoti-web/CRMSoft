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
var GetAssignmentRulesHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAssignmentRulesHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_assignment_rules_query_1 = require("./get-assignment-rules.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetAssignmentRulesHandler = GetAssignmentRulesHandler_1 = class GetAssignmentRulesHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetAssignmentRulesHandler_1.name);
    }
    async execute(query) {
        try {
            const where = { isActive: true };
            if (query.entityType)
                where.entityType = query.entityType;
            if (query.status)
                where.status = query.status;
            const page = query.page || 1;
            const limit = query.limit || 20;
            const [data, total] = await Promise.all([
                this.prisma.working.assignmentRule.findMany({
                    where, orderBy: { priority: 'asc' },
                    skip: (page - 1) * limit, take: limit,
                }),
                this.prisma.working.assignmentRule.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        catch (error) {
            this.logger.error(`GetAssignmentRulesHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetAssignmentRulesHandler = GetAssignmentRulesHandler;
exports.GetAssignmentRulesHandler = GetAssignmentRulesHandler = GetAssignmentRulesHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_assignment_rules_query_1.GetAssignmentRulesQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetAssignmentRulesHandler);
//# sourceMappingURL=get-assignment-rules.handler.js.map