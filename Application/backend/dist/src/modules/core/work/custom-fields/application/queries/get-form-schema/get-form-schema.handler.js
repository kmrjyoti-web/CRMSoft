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
var GetFormSchemaHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFormSchemaHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const get_form_schema_query_1 = require("./get-form-schema.query");
let GetFormSchemaHandler = GetFormSchemaHandler_1 = class GetFormSchemaHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetFormSchemaHandler_1.name);
    }
    async execute(query) {
        try {
            const definitions = await this.prisma.customFieldDefinition.findMany({
                where: { entityType: query.entityType.toUpperCase(), isActive: true },
                orderBy: { sortOrder: 'asc' },
            });
            return definitions.map((d) => ({
                definitionId: d.id,
                fieldName: d.fieldName,
                fieldLabel: d.fieldLabel,
                fieldType: d.fieldType,
                isRequired: d.isRequired,
                defaultValue: d.defaultValue,
                options: d.options,
                sortOrder: d.sortOrder,
                valueColumn: this.getValueColumn(d.fieldType),
            }));
        }
        catch (error) {
            this.logger.error(`GetFormSchemaHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    getValueColumn(fieldType) {
        const map = {
            TEXT: 'valueText',
            NUMBER: 'valueNumber',
            DATE: 'valueDate',
            BOOLEAN: 'valueBoolean',
            JSON: 'valueJson',
            DROPDOWN: 'valueDropdown',
        };
        return map[fieldType] ?? 'valueText';
    }
};
exports.GetFormSchemaHandler = GetFormSchemaHandler;
exports.GetFormSchemaHandler = GetFormSchemaHandler = GetFormSchemaHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_form_schema_query_1.GetFormSchemaQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetFormSchemaHandler);
//# sourceMappingURL=get-form-schema.handler.js.map