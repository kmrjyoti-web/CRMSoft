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
var ReplaceFiltersHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplaceFiltersHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const replace_filters_command_1 = require("./replace-filters.command");
const entity_filter_types_1 = require("../../../entity-filter.types");
let ReplaceFiltersHandler = ReplaceFiltersHandler_1 = class ReplaceFiltersHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ReplaceFiltersHandler_1.name);
    }
    async execute(command) {
        try {
            const config = entity_filter_types_1.ENTITY_FILTER_CONFIG[command.entityType];
            const entity = await this.prisma[config.entityModel].findUnique({
                where: { id: command.entityId },
            });
            if (!entity) {
                throw new common_1.NotFoundException(`${command.entityType} ${command.entityId} not found`);
            }
            let deleteWhere = { [config.fkField]: command.entityId };
            if (command.category) {
                const lookup = await this.prisma.platform.masterLookup.findFirst({
                    where: { category: command.category.toUpperCase() },
                });
                if (!lookup)
                    throw new common_1.NotFoundException(`Category ${command.category} not found`);
                const categoryValueIds = await this.prisma.platform.lookupValue.findMany({
                    where: { lookupId: lookup.id },
                    select: { id: true },
                });
                deleteWhere.lookupValueId = { in: categoryValueIds.map(v => v.id) };
            }
            const deleted = await this.prisma[config.filterModel].deleteMany({
                where: deleteWhere,
            });
            const validValues = await this.prisma.platform.lookupValue.findMany({
                where: { id: { in: command.lookupValueIds }, isActive: true },
            });
            let assigned = 0;
            for (const val of validValues) {
                await this.prisma[config.filterModel].create({
                    data: { [config.fkField]: command.entityId, lookupValueId: val.id },
                });
                assigned++;
            }
            this.logger.log(`Filters replaced for ${command.entityType}/${command.entityId}: ${deleted.count} removed, ${assigned} assigned`);
            return { removed: deleted.count, assigned };
        }
        catch (error) {
            this.logger.error(`ReplaceFiltersHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ReplaceFiltersHandler = ReplaceFiltersHandler;
exports.ReplaceFiltersHandler = ReplaceFiltersHandler = ReplaceFiltersHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(replace_filters_command_1.ReplaceFiltersCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReplaceFiltersHandler);
//# sourceMappingURL=replace-filters.handler.js.map