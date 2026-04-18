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
var ReorderValuesHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReorderValuesHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const reorder_values_command_1 = require("./reorder-values.command");
let ReorderValuesHandler = ReorderValuesHandler_1 = class ReorderValuesHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ReorderValuesHandler_1.name);
    }
    async execute(command) {
        try {
            const lookup = await this.prisma.platform.masterLookup.findUnique({
                where: { id: command.lookupId },
            });
            if (!lookup)
                throw new common_1.NotFoundException(`Lookup ${command.lookupId} not found`);
            const updates = command.orderedIds.map((id, index) => this.prisma.platform.lookupValue.update({
                where: { id },
                data: { rowIndex: index },
            }));
            await this.prisma.$transaction(updates);
            this.logger.log(`Values reordered for ${lookup.category}`);
        }
        catch (error) {
            this.logger.error(`ReorderValuesHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ReorderValuesHandler = ReorderValuesHandler;
exports.ReorderValuesHandler = ReorderValuesHandler = ReorderValuesHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(reorder_values_command_1.ReorderValuesCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReorderValuesHandler);
//# sourceMappingURL=reorder-values.handler.js.map