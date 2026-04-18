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
var CopyFiltersHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopyFiltersHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const copy_filters_command_1 = require("./copy-filters.command");
const entity_filter_types_1 = require("../../../entity-filter.types");
let CopyFiltersHandler = CopyFiltersHandler_1 = class CopyFiltersHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CopyFiltersHandler_1.name);
    }
    async execute(command) {
        const sourceConfig = entity_filter_types_1.ENTITY_FILTER_CONFIG[command.sourceType];
        const targetConfig = entity_filter_types_1.ENTITY_FILTER_CONFIG[command.targetType];
        const sourceFilters = await this.prisma[sourceConfig.filterModel].findMany({
            where: { [sourceConfig.fkField]: command.sourceId },
            select: { lookupValueId: true },
        });
        let copied = 0;
        for (const sf of sourceFilters) {
            try {
                await this.prisma[targetConfig.filterModel].create({
                    data: {
                        [targetConfig.fkField]: command.targetId,
                        lookupValueId: sf.lookupValueId,
                    },
                });
                copied++;
            }
            catch (e) {
                if (e.code !== 'P2002')
                    throw e;
            }
        }
        this.logger.log(`Copied ${copied} filters from ${command.sourceType}/${command.sourceId} ? ${command.targetType}/${command.targetId}`);
        return copied;
    }
};
exports.CopyFiltersHandler = CopyFiltersHandler;
exports.CopyFiltersHandler = CopyFiltersHandler = CopyFiltersHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(copy_filters_command_1.CopyFiltersCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CopyFiltersHandler);
//# sourceMappingURL=copy-filters.handler.js.map