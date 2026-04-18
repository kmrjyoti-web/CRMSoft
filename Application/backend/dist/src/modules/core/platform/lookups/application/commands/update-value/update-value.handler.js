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
var UpdateValueHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateValueHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const update_value_command_1 = require("./update-value.command");
let UpdateValueHandler = UpdateValueHandler_1 = class UpdateValueHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateValueHandler_1.name);
    }
    async execute(command) {
        try {
            const val = await this.prisma.platform.lookupValue.findUnique({
                where: { id: command.valueId },
            });
            if (!val)
                throw new common_1.NotFoundException(`LookupValue ${command.valueId} not found`);
            if (command.data.isDefault) {
                await this.prisma.platform.lookupValue.updateMany({
                    where: { lookupId: val.lookupId, isDefault: true },
                    data: { isDefault: false },
                });
            }
            const updateData = {};
            if (command.data.label)
                updateData.label = command.data.label.trim();
            if (command.data.icon !== undefined)
                updateData.icon = command.data.icon || null;
            if (command.data.color !== undefined)
                updateData.color = command.data.color || null;
            if (command.data.isDefault !== undefined)
                updateData.isDefault = command.data.isDefault;
            if (command.data.configJson !== undefined)
                updateData.configJson = command.data.configJson;
            await this.prisma.platform.lookupValue.update({ where: { id: command.valueId }, data: updateData });
            this.logger.log(`LookupValue ${val.value} updated`);
        }
        catch (error) {
            this.logger.error(`UpdateValueHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateValueHandler = UpdateValueHandler;
exports.UpdateValueHandler = UpdateValueHandler = UpdateValueHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_value_command_1.UpdateValueCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateValueHandler);
//# sourceMappingURL=update-value.handler.js.map