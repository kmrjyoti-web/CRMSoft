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
var RemoveFilterHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveFilterHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const remove_filter_command_1 = require("./remove-filter.command");
const entity_filter_types_1 = require("../../../entity-filter.types");
let RemoveFilterHandler = RemoveFilterHandler_1 = class RemoveFilterHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RemoveFilterHandler_1.name);
    }
    async execute(command) {
        try {
            const config = entity_filter_types_1.ENTITY_FILTER_CONFIG[command.entityType];
            await this.prisma[config.filterModel].deleteMany({
                where: {
                    [config.fkField]: command.entityId,
                    lookupValueId: command.lookupValueId,
                },
            });
            this.logger.log(`Filter ${command.lookupValueId} removed from ${command.entityType}/${command.entityId}`);
        }
        catch (error) {
            this.logger.error(`RemoveFilterHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RemoveFilterHandler = RemoveFilterHandler;
exports.RemoveFilterHandler = RemoveFilterHandler = RemoveFilterHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(remove_filter_command_1.RemoveFilterCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RemoveFilterHandler);
//# sourceMappingURL=remove-filter.handler.js.map