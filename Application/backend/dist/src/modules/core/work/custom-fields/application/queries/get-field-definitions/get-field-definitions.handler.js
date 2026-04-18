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
var GetFieldDefinitionsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFieldDefinitionsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const get_field_definitions_query_1 = require("./get-field-definitions.query");
let GetFieldDefinitionsHandler = GetFieldDefinitionsHandler_1 = class GetFieldDefinitionsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetFieldDefinitionsHandler_1.name);
    }
    async execute(query) {
        try {
            const where = { entityType: query.entityType.toUpperCase() };
            if (query.activeOnly !== false)
                where.isActive = true;
            return this.prisma.customFieldDefinition.findMany({
                where,
                orderBy: { sortOrder: 'asc' },
            });
        }
        catch (error) {
            this.logger.error(`GetFieldDefinitionsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetFieldDefinitionsHandler = GetFieldDefinitionsHandler;
exports.GetFieldDefinitionsHandler = GetFieldDefinitionsHandler = GetFieldDefinitionsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_field_definitions_query_1.GetFieldDefinitionsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetFieldDefinitionsHandler);
//# sourceMappingURL=get-field-definitions.handler.js.map