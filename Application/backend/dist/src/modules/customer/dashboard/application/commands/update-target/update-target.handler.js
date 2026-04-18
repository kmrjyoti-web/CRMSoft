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
var UpdateTargetHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTargetHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const update_target_command_1 = require("./update-target.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const common_1 = require("@nestjs/common");
let UpdateTargetHandler = UpdateTargetHandler_1 = class UpdateTargetHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateTargetHandler_1.name);
    }
    async execute(command) {
        try {
            const target = await this.prisma.working.salesTarget.findUnique({ where: { id: command.id } });
            if (!target)
                throw new common_1.NotFoundException('Target not found');
            const data = {};
            if (command.targetValue !== undefined)
                data.targetValue = command.targetValue;
            if (command.name !== undefined)
                data.name = command.name;
            if (command.notes !== undefined)
                data.notes = command.notes;
            if (command.isActive !== undefined)
                data.isActive = command.isActive;
            return this.prisma.working.salesTarget.update({ where: { id: command.id }, data });
        }
        catch (error) {
            this.logger.error(`UpdateTargetHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateTargetHandler = UpdateTargetHandler;
exports.UpdateTargetHandler = UpdateTargetHandler = UpdateTargetHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_target_command_1.UpdateTargetCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateTargetHandler);
//# sourceMappingURL=update-target.handler.js.map