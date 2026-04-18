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
var DeactivateValueHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeactivateValueHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const deactivate_value_command_1 = require("./deactivate-value.command");
let DeactivateValueHandler = DeactivateValueHandler_1 = class DeactivateValueHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DeactivateValueHandler_1.name);
    }
    async execute(command) {
        try {
            const val = await this.prisma.platform.lookupValue.findUnique({ where: { id: command.valueId } });
            if (!val)
                throw new common_1.NotFoundException(`LookupValue ${command.valueId} not found`);
            await this.prisma.platform.lookupValue.update({
                where: { id: command.valueId },
                data: { isActive: false },
            });
            this.logger.log(`LookupValue ${val.value} deactivated`);
        }
        catch (error) {
            this.logger.error(`DeactivateValueHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeactivateValueHandler = DeactivateValueHandler;
exports.DeactivateValueHandler = DeactivateValueHandler = DeactivateValueHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(deactivate_value_command_1.DeactivateValueCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeactivateValueHandler);
//# sourceMappingURL=deactivate-value.handler.js.map