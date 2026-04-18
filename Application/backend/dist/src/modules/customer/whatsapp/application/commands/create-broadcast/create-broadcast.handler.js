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
var CreateBroadcastHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBroadcastHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_broadcast_command_1 = require("./create-broadcast.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let CreateBroadcastHandler = CreateBroadcastHandler_1 = class CreateBroadcastHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateBroadcastHandler_1.name);
    }
    async execute(command) {
        try {
            const broadcast = await this.prisma.working.waBroadcast.create({
                data: {
                    wabaId: command.wabaId,
                    name: command.name,
                    templateId: command.templateId,
                    status: 'DRAFT',
                    scheduledAt: command.scheduledAt,
                    throttlePerSecond: command.throttlePerSecond,
                    createdById: command.userId,
                    createdByName: command.userName,
                },
            });
            this.logger.log(`Broadcast "${command.name}" created with status DRAFT by user ${command.userId}`);
            return broadcast;
        }
        catch (error) {
            this.logger.error(`CreateBroadcastHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateBroadcastHandler = CreateBroadcastHandler;
exports.CreateBroadcastHandler = CreateBroadcastHandler = CreateBroadcastHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_broadcast_command_1.CreateBroadcastCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateBroadcastHandler);
//# sourceMappingURL=create-broadcast.handler.js.map