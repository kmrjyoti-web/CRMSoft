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
var CreateTargetHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTargetHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_target_command_1 = require("./create-target.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let CreateTargetHandler = CreateTargetHandler_1 = class CreateTargetHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateTargetHandler_1.name);
    }
    async execute(cmd) {
        try {
            return this.prisma.working.salesTarget.create({
                data: {
                    name: cmd.name,
                    metric: cmd.metric,
                    targetValue: cmd.targetValue,
                    period: cmd.period,
                    periodStart: new Date(cmd.periodStart),
                    periodEnd: new Date(cmd.periodEnd),
                    userId: cmd.userId,
                    roleId: cmd.roleId,
                    notes: cmd.notes,
                    createdById: cmd.createdById,
                },
            });
        }
        catch (error) {
            this.logger.error(`CreateTargetHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateTargetHandler = CreateTargetHandler;
exports.CreateTargetHandler = CreateTargetHandler = CreateTargetHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_target_command_1.CreateTargetCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateTargetHandler);
//# sourceMappingURL=create-target.handler.js.map