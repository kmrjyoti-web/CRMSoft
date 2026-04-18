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
var AddValueHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddValueHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const add_value_command_1 = require("./add-value.command");
let AddValueHandler = AddValueHandler_1 = class AddValueHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AddValueHandler_1.name);
    }
    async execute(command) {
        try {
            const lookup = await this.prisma.platform.masterLookup.findUnique({
                where: { id: command.lookupId },
            });
            if (!lookup)
                throw new common_1.NotFoundException(`Lookup ${command.lookupId} not found`);
            const existing = await this.prisma.platform.lookupValue.findFirst({
                where: { lookupId: command.lookupId, value: command.value },
            });
            if (existing)
                throw new common_1.ConflictException(`Value "${command.value}" already exists in ${lookup.category}`);
            const maxRow = await this.prisma.platform.lookupValue.aggregate({
                where: { lookupId: command.lookupId },
                _max: { rowIndex: true },
            });
            const nextIndex = (maxRow._max.rowIndex ?? -1) + 1;
            if (command.isDefault) {
                await this.prisma.platform.lookupValue.updateMany({
                    where: { lookupId: command.lookupId, isDefault: true },
                    data: { isDefault: false },
                });
            }
            const val = await this.prisma.platform.lookupValue.create({
                data: {
                    lookupId: command.lookupId,
                    value: command.value.trim(),
                    label: command.label.trim(),
                    icon: command.icon || null,
                    color: command.color || null,
                    rowIndex: nextIndex,
                    isDefault: command.isDefault ?? false,
                    parentId: command.parentId || null,
                    configJson: command.configJson || null,
                },
            });
            this.logger.log(`Value "${command.value}" added to ${lookup.category}`);
            return val.id;
        }
        catch (error) {
            this.logger.error(`AddValueHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.AddValueHandler = AddValueHandler;
exports.AddValueHandler = AddValueHandler = AddValueHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(add_value_command_1.AddValueCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AddValueHandler);
//# sourceMappingURL=add-value.handler.js.map