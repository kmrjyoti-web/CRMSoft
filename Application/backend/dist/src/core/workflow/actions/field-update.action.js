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
var FieldUpdateAction_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldUpdateAction = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ALLOWED_TABLES = ['lead', 'contact', 'demo', 'tourPlan', 'quotation', 'activity', 'organization'];
let FieldUpdateAction = FieldUpdateAction_1 = class FieldUpdateAction {
    constructor(prisma) {
        this.prisma = prisma;
        this.type = 'FIELD_UPDATE';
        this.logger = new common_1.Logger(FieldUpdateAction_1.name);
    }
    async execute(config, context) {
        const { entityTable, field, value } = config;
        if (!entityTable || !field) {
            return { status: 'FAILED', errorMessage: 'Missing entityTable or field in config' };
        }
        if (!ALLOWED_TABLES.includes(entityTable)) {
            return { status: 'FAILED', errorMessage: `Table "${entityTable}" is not in allowed list` };
        }
        try {
            const result = await this.prisma[entityTable].update({
                where: { id: context.entityId },
                data: { [field]: value },
            });
            this.logger.log(`Updated ${entityTable}.${field} for entity ${context.entityId}`);
            return { status: 'SUCCESS', result: { updatedField: field, newValue: value } };
        }
        catch (error) {
            return { status: 'FAILED', errorMessage: error instanceof Error ? error.message : String(error) };
        }
    }
};
exports.FieldUpdateAction = FieldUpdateAction;
exports.FieldUpdateAction = FieldUpdateAction = FieldUpdateAction_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FieldUpdateAction);
//# sourceMappingURL=field-update.action.js.map