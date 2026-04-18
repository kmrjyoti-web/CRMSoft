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
const common_1 = require("@nestjs/common");
const update_target_command_1 = require("./update-target.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let UpdateTargetHandler = UpdateTargetHandler_1 = class UpdateTargetHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateTargetHandler_1.name);
    }
    async execute(cmd) {
        try {
            const updateData = { ...cmd.data };
            if (cmd.data.metric)
                updateData.metric = cmd.data.metric;
            if (cmd.data.period)
                updateData.period = cmd.data.period;
            if (cmd.data.periodStart)
                updateData.periodStart = new Date(cmd.data.periodStart);
            if (cmd.data.periodEnd)
                updateData.periodEnd = new Date(cmd.data.periodEnd);
            return this.prisma.working.salesTarget.update({
                where: { id: cmd.id },
                data: updateData,
            });
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