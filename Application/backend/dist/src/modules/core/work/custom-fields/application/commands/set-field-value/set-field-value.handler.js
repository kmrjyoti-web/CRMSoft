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
var SetFieldValueHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetFieldValueHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const set_field_value_command_1 = require("./set-field-value.command");
let SetFieldValueHandler = SetFieldValueHandler_1 = class SetFieldValueHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SetFieldValueHandler_1.name);
    }
    async execute(cmd) {
        try {
            const results = await this.prisma.$transaction(async (tx) => {
                const saved = [];
                for (const v of cmd.values) {
                    const existing = await tx.entityConfigValue.findFirst({
                        where: { definitionId: v.definitionId, entityId: cmd.entityId },
                    });
                    const data = {
                        valueText: v.valueText,
                        valueNumber: v.valueNumber,
                        valueDate: v.valueDate ? new Date(v.valueDate) : null,
                        valueBoolean: v.valueBoolean,
                        valueJson: v.valueJson,
                        valueDropdown: v.valueDropdown,
                    };
                    if (existing) {
                        saved.push(await tx.entityConfigValue.update({
                            where: { id: existing.id },
                            data,
                        }));
                    }
                    else {
                        saved.push(await tx.entityConfigValue.create({
                            data: {
                                definitionId: v.definitionId,
                                entityType: cmd.entityType.toUpperCase(),
                                entityId: cmd.entityId,
                                ...data,
                            },
                        }));
                    }
                }
                return saved;
            });
            return { saved: results.length };
        }
        catch (error) {
            this.logger.error(`SetFieldValueHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SetFieldValueHandler = SetFieldValueHandler;
exports.SetFieldValueHandler = SetFieldValueHandler = SetFieldValueHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(set_field_value_command_1.SetFieldValueCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SetFieldValueHandler);
//# sourceMappingURL=set-field-value.handler.js.map