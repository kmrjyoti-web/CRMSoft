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
var AssignFiltersHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignFiltersHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const assign_filters_command_1 = require("./assign-filters.command");
const entity_filter_types_1 = require("../../../entity-filter.types");
let AssignFiltersHandler = AssignFiltersHandler_1 = class AssignFiltersHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AssignFiltersHandler_1.name);
    }
    async execute(command) {
        const config = entity_filter_types_1.ENTITY_FILTER_CONFIG[command.entityType];
        const entity = await this.prisma[config.entityModel].findUnique({
            where: { id: command.entityId },
        });
        if (!entity) {
            throw new common_1.NotFoundException(`${command.entityType} ${command.entityId} not found`);
        }
        const values = await this.prisma.platform.lookupValue.findMany({
            where: { id: { in: command.lookupValueIds }, isActive: true },
        });
        const validIds = new Set(values.map(v => v.id));
        let assigned = 0;
        let skipped = 0;
        for (const valueId of command.lookupValueIds) {
            if (!validIds.has(valueId)) {
                skipped++;
                continue;
            }
            try {
                await this.prisma[config.filterModel].create({
                    data: {
                        [config.fkField]: command.entityId,
                        lookupValueId: valueId,
                    },
                });
                assigned++;
            }
            catch (e) {
                if (e.code === 'P2002') {
                    skipped++;
                }
                else {
                    throw e;
                }
            }
        }
        this.logger.log(`Filters assigned to ${command.entityType}/${command.entityId}: ${assigned} new, ${skipped} skipped`);
        return { assigned, skipped };
    }
};
exports.AssignFiltersHandler = AssignFiltersHandler;
exports.AssignFiltersHandler = AssignFiltersHandler = AssignFiltersHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(assign_filters_command_1.AssignFiltersCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssignFiltersHandler);
//# sourceMappingURL=assign-filters.handler.js.map