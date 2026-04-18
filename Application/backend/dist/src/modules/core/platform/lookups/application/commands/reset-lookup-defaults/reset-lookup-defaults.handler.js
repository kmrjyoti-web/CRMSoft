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
var ResetLookupDefaultsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetLookupDefaultsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const reset_lookup_defaults_command_1 = require("./reset-lookup-defaults.command");
const lookup_seed_data_1 = require("../../../data/lookup-seed-data");
let ResetLookupDefaultsHandler = ResetLookupDefaultsHandler_1 = class ResetLookupDefaultsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ResetLookupDefaultsHandler_1.name);
    }
    async execute(command) {
        try {
            const tenantId = command.tenantId || '';
            let restoredCount = 0;
            for (const lk of lookup_seed_data_1.LOOKUP_SEED_DATA) {
                const lookup = await this.prisma.platform.masterLookup.upsert({
                    where: { tenantId_category: { tenantId, category: lk.category } },
                    create: {
                        tenantId,
                        category: lk.category,
                        displayName: lk.displayName,
                        isSystem: lk.isSystem,
                        isActive: true,
                    },
                    update: {
                        displayName: lk.displayName,
                        isActive: true,
                    },
                });
                for (let i = 0; i < lk.values.length; i++) {
                    const v = lk.values[i];
                    await this.prisma.platform.lookupValue.upsert({
                        where: {
                            tenantId_lookupId_value: {
                                tenantId,
                                lookupId: lookup.id,
                                value: v.value,
                            },
                        },
                        create: {
                            tenantId,
                            lookupId: lookup.id,
                            value: v.value,
                            label: v.label,
                            icon: v.icon || null,
                            color: v.color || null,
                            rowIndex: i,
                            isActive: true,
                        },
                        update: {
                            label: v.label,
                            icon: v.icon || null,
                            color: v.color || null,
                            rowIndex: i,
                            isActive: true,
                        },
                    });
                }
                restoredCount++;
            }
            return { restoredCount };
        }
        catch (error) {
            this.logger.error(`ResetLookupDefaultsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ResetLookupDefaultsHandler = ResetLookupDefaultsHandler;
exports.ResetLookupDefaultsHandler = ResetLookupDefaultsHandler = ResetLookupDefaultsHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(reset_lookup_defaults_command_1.ResetLookupDefaultsCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ResetLookupDefaultsHandler);
//# sourceMappingURL=reset-lookup-defaults.handler.js.map